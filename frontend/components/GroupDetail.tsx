'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { formatAmount, toStroops, shortenAddress } from '@/lib/utils';
import { Group, Payment, Member } from '@/lib/stellar';

interface GroupDetailProps {
  group: Group & { id: number };
  members: Member[];
  payments: Payment[];
  userAddress: string;
  onBack: () => void;
  onAddExpense: (amount: string, description: string) => void;
  onSettle: () => void;
}

export default function GroupDetail({
  group,
  members,
  payments,
  userAddress,
  onBack,
  onAddExpense,
  onSettle,
}: GroupDetailProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddExpense = () => {
    if (amount && description) {
      onAddExpense(toStroops(parseFloat(amount)), description);
      setAmount('');
      setDescription('');
    }
  };

  const userBalance = members.find((m) => m.address === userAddress)?.balance || '0';
  const balanceNum = parseInt(userBalance) / 10000000;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </Button>

      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-3xl">{group.name}</CardTitle>
          <CardDescription className="text-blue-100">
            Group ID: {group.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Members</p>
                <p className="text-2xl font-bold">{group.total_members}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Total Expenses</p>
                <p className="text-2xl font-bold">{formatAmount(group.total_paid)} XLM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Your Balance</p>
                <p className={`text-2xl font-bold ${balanceNum >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {balanceNum >= 0 ? '+' : ''}{balanceNum.toFixed(2)} XLM
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense */}
        {!group.is_settled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add Expense
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Amount (XLM)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <Input
                  placeholder="What's this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleAddExpense} className="w-full" size="lg">
                Add Expense
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Members & Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Members & Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => {
                const bal = parseInt(member.balance) / 10000000;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-mono">
                      {shortenAddress(member.address)}
                      {member.address === userAddress && (
                        <span className="ml-2 text-blue-600 font-semibold">(You)</span>
                      )}
                    </span>
                    <span
                      className={`font-semibold ${
                        bal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {bal >= 0 ? '+' : ''}{bal.toFixed(2)} XLM
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No expenses yet</p>
            ) : (
              payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-500">
                      Paid by {shortenAddress(payment.payer)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(parseInt(payment.timestamp) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatAmount(payment.amount)} XLM
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settle Button */}
      {!group.is_settled && group.creator === userAddress && payments.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <Button onClick={onSettle} className="w-full" size="lg" variant="default">
              Settle Group & Distribute Funds
            </Button>
            <p className="text-sm text-gray-600 text-center mt-2">
              Only the group creator can settle the expenses
            </p>
          </CardContent>
        </Card>
      )}

      {group.is_settled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-800">
              This group has been settled!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
