'use client';

import { useState, useEffect, useCallback } from 'react';
import WalletConnect from '@/components/WalletConnect';
import CreateGroupModal from '@/components/CreateGroupModal';
import GroupCard from '@/components/GroupCard';
import GroupDetail from '@/components/GroupDetail';
import { Button } from '@/components/ui/button';
import { Plus, Wallet2 } from 'lucide-react';
import * as StellarSDK from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import {
  CONTRACT_ID,
  TOKEN_ID,
  server,
  Group,
  Payment,
  Member,
  scValToNative,
  stringToScVal,
  u64ToScVal,
  i128ToScVal,
  addressToScVal,
} from '@/lib/stellar';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [groups, setGroups] = useState<(Group & { id: number })[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [groupPayments, setGroupPayments] = useState<Payment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load groups
  const loadGroups = async () => {
    if (!connected) return;
    
    setLoading(true);
    try {
      // Get group count
      const contract = new StellarSDK.Contract(CONTRACT_ID);
      const operation = contract.call('get_group_count');
      
      const tx = new StellarSDK.TransactionBuilder(
        new StellarSDK.Account(userAddress, '0'),
        {
          fee: '100',
          networkPassphrase: StellarSDK.Networks.TESTNET,
        }
      )
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simulated = await server.simulateTransaction(tx);
      
      if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
        const count = scValToNative(simulated.result!.retval);
        
        // Load each group
        const groupsData: (Group & { id: number })[] = [];
        for (let i = 0; i < count; i++) {
          const groupOp = contract.call('get_group', u64ToScVal(i));
          const groupTx = new StellarSDK.TransactionBuilder(
            new StellarSDK.Account(userAddress, '0'),
            {
              fee: '100',
              networkPassphrase: StellarSDK.Networks.TESTNET,
            }
          )
            .addOperation(groupOp)
            .setTimeout(30)
            .build();

          const groupSim = await server.simulateTransaction(groupTx);
          
          if (StellarSDK.rpc.Api.isSimulationSuccess(groupSim)) {
            const groupData = scValToNative(groupSim.result!.retval);
            groupsData.push({ ...groupData, id: i });
          }
        }
        
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
    setLoading(false);
  };

  // Load group details
  const loadGroupDetails = async (groupId: number) => {
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID);
      
      // Get members
      const membersOp = contract.call('get_members', u64ToScVal(groupId));
      const membersTx = new StellarSDK.TransactionBuilder(
        new StellarSDK.Account(userAddress, '0'),
        {
          fee: '100',
          networkPassphrase: StellarSDK.Networks.TESTNET,
        }
      )
        .addOperation(membersOp)
        .setTimeout(30)
        .build();

      const membersSim = await server.simulateTransaction(membersTx);
      
      if (StellarSDK.rpc.Api.isSimulationSuccess(membersSim)) {
        const membersData = scValToNative(membersSim.result!.retval);
        
        // Get balance for each member
        const membersWithBalance: Member[] = [];
        for (const addr of membersData) {
          const balOp = contract.call('get_balance', u64ToScVal(groupId), addressToScVal(addr));
          const balTx = new StellarSDK.TransactionBuilder(
            new StellarSDK.Account(userAddress, '0'),
            {
              fee: '100',
              networkPassphrase: StellarSDK.Networks.TESTNET,
            }
          )
            .addOperation(balOp)
            .setTimeout(30)
            .build();

          const balSim = await server.simulateTransaction(balTx);
          if (StellarSDK.rpc.Api.isSimulationSuccess(balSim)) {
            const balance = scValToNative(balSim.result!.retval);
            membersWithBalance.push({ address: addr, balance: balance.toString() });
          }
        }
        
        setGroupMembers(membersWithBalance);
      }

      // Get payments
      const paymentsOp = contract.call('get_payments', u64ToScVal(groupId));
      const paymentsTx = new StellarSDK.TransactionBuilder(
        new StellarSDK.Account(userAddress, '0'),
        {
          fee: '100',
          networkPassphrase: StellarSDK.Networks.TESTNET,
        }
      )
        .addOperation(paymentsOp)
        .setTimeout(30)
        .build();

      const paymentsSim = await server.simulateTransaction(paymentsTx);
      if (StellarSDK.rpc.Api.isSimulationSuccess(paymentsSim)) {
        const paymentsData = scValToNative(paymentsSim.result!.retval);
        setGroupPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    }
  };

  // Create group
  const createGroup = async (name: string, members: string[]) => {
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID);
      const membersScVal = StellarSDK.nativeToScVal(members.map(m => new StellarSDK.Address(m)));
      
      const operation = contract.call(
        'create_group',
        addressToScVal(userAddress),
        stringToScVal(name),
        addressToScVal(TOKEN_ID),
        membersScVal
      );

      const account = await server.getAccount(userAddress);
      const tx = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: StellarSDK.Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const { signedTxXdr } = await signTransaction(
        prepared.toXDR(),
        { networkPassphrase: StellarSDK.Networks.TESTNET }
      );

      if (!signedTxXdr) {
        throw new Error('Failed to sign transaction');
      }

      const signedTx = StellarSDK.TransactionBuilder.fromXDR(
        signedTxXdr,
        StellarSDK.Networks.TESTNET
      );

      const result = await server.sendTransaction(signedTx as StellarSDK.Transaction);
      
      if (result.status === 'ERROR') {
        if (result.errorResult) {
          console.error('Transaction error details:', result.errorResult);
        }
        throw new Error(`Transaction failed on-chain`);
      }

      // Wait for confirmation
      await server.pollTransaction(result.hash);
      setShowCreateModal(false);
      await loadGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(`Failed to create group: ${error.message || 'Unknown error'}`);
    }
  };

  // Add expense
  const addExpense = async (groupId: number, amount: string, description: string) => {
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID);
      
      const operation = contract.call(
        'add_expense',
        u64ToScVal(groupId),
        addressToScVal(userAddress),
        i128ToScVal(amount),
        stringToScVal(description)
      );

      const account = await server.getAccount(userAddress);
      const tx = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: StellarSDK.Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const { signedTxXdr } = await signTransaction(
        prepared.toXDR(),
        { networkPassphrase: StellarSDK.Networks.TESTNET }
      );

      if (!signedTxXdr) {
        throw new Error('Failed to sign transaction');
      }

      const signedTx = StellarSDK.TransactionBuilder.fromXDR(
        signedTxXdr,
        StellarSDK.Networks.TESTNET
      );

      const result = await server.sendTransaction(signedTx as StellarSDK.Transaction);
      
      if (result.status === 'ERROR') {
        throw new Error('Transaction failed on-chain');
      }

      // Wait for confirmation
      await server.pollTransaction(result.hash);
      
      await loadGroups();
      if (selectedGroup !== null) {
        await loadGroupDetails(selectedGroup);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  // Settle group
  const settleGroup = async (groupId: number) => {
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID);
      
      const operation = contract.call(
        'settle_group',
        u64ToScVal(groupId),
        addressToScVal(userAddress)
      );

      const account = await server.getAccount(userAddress);
      const tx = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: StellarSDK.Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const { signedTxXdr } = await signTransaction(
        prepared.toXDR(),
        { networkPassphrase: StellarSDK.Networks.TESTNET }
      );

      if (!signedTxXdr) {
        throw new Error('Failed to sign transaction');
      }

      const signedTx = StellarSDK.TransactionBuilder.fromXDR(
        signedTxXdr,
        StellarSDK.Networks.TESTNET
      );

      const result = await server.sendTransaction(signedTx as StellarSDK.Transaction);
      
      if (result.status === 'ERROR') {
        throw new Error('Transaction failed on-chain');
      }

      // Wait for confirmation
      await server.pollTransaction(result.hash);
      
      await loadGroups();
      if (selectedGroup !== null) {
        await loadGroupDetails(selectedGroup);
      }
    } catch (error) {
      console.error('Error settling group:', error);
      alert('Failed to settle group');
    }
  };

  useEffect(() => {
    if (connected) {
      loadGroups();
    }
  }, [connected]);

  useEffect(() => {
    if (selectedGroup !== null) {
      loadGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);

  const handleConnect = useCallback((publicKey: string) => {
    setConnected(true);
    setUserAddress(publicKey);
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnected(false);
    setUserAddress('');
    setGroups([]);
    setSelectedGroup(null);
  }, []);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <Wallet2 className="w-20 h-20 mx-auto text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <p className="text-xl text-gray-600">
              Split expenses fairly with friends, powered by Stellar
            </p>
          </div>
          <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>
      </div>
    );
  }

  if (selectedGroup !== null) {
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>

          <GroupDetail
            group={group}
            members={groupMembers}
            payments={groupPayments}
            userAddress={userAddress}
            onBack={() => setSelectedGroup(null)}
            onAddExpense={(amount, desc) => addExpense(selectedGroup, amount, desc)}
            onSettle={() => settleGroup(selectedGroup)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SplitPay
          </h1>
          <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Groups</h2>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-5 h-5" />
            Create Group
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No groups yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => setSelectedGroup(group.id)}
              />
            ))}
          </div>
        )}

        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createGroup}
          userAddress={userAddress}
        />
      </div>
    </div>
  );
}
