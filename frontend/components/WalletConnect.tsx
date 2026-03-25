'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
import {
  isConnected,
  getAddress,
  setAllowed,
  isAllowed,
} from '@stellar/freighter-api';

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [freighterInstalled, setFreighterInstalled] = useState(false);

  useEffect(() => {
    // Check if Freighter is installed
    const checkFreighter = async () => {
      try {
        const result = await isConnected();
        if (result && result.isConnected) {
          setFreighterInstalled(true);
          // If already allowed, get the address automatically
          const allowed = await isAllowed();
          if (allowed && allowed.isAllowed) {
            const result = await getAddress();
            if (result && result.address) {
              setPublicKey(result.address);
              setConnected(true);
              onConnect(result.address);
            }
          }
        }
      } catch (e) {
        console.error("Freighter not detected", e);
      }
    };
    checkFreighter();
  }, [onConnect]);

  const connectWallet = async () => {
    if (!freighterInstalled) {
      window.open('https://www.freighter.app/', '_blank');
      return;
    }

    try {
      // Ensure the user has allowed the site
      await setAllowed();

      const result = await getAddress();
      if (result && result.address) {
        setPublicKey(result.address);
        setConnected(true);
        onConnect(result.address);
      } else if (result && result.error) {
        alert(`Wallet error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      alert('Failed to connect wallet. Please make sure Freighter is unlocked.');
    }
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey('');
    onDisconnect();
  };

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <Wallet className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {shortenAddress(publicKey)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} size="lg">
      <Wallet className="w-5 h-5" />
      {freighterInstalled ? 'Connect Wallet' : 'Install Freighter'}
    </Button>
  );
}
