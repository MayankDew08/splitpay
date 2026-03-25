import * as StellarSDK from '@stellar/stellar-sdk';

export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID!;
export const TOKEN_ID = process.env.NEXT_PUBLIC_TOKEN_ID!;
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as 'testnet' | 'mainnet';
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL!;
export const SOROBAN_URL = process.env.NEXT_PUBLIC_SOROBAN_URL!;

export const server = new StellarSDK.rpc.Server(SOROBAN_URL);
export const horizonServer = new StellarSDK.Horizon.Server(HORIZON_URL);

export interface Group {
  id: string;
  name: string;
  creator: string;
  token: string;
  total_members: number;
  total_paid: string;
  is_settled: boolean;
}

export interface Payment {
  payer: string;
  amount: string;
  description: string;
  timestamp: string;
}

export interface Member {
  address: string;
  balance: string;
}

// Helper to build contract calls
export function buildContractCall(
  method: string,
  params: StellarSDK.xdr.ScVal[]
): StellarSDK.xdr.InvokeContractArgs {
  return StellarSDK.xdr.InvokeContractArgs.fromXDR(
    new StellarSDK.Contract(CONTRACT_ID).call(method, ...params).toXDR()
  );
}

// Convert string to ScVal
export function stringToScVal(str: string): StellarSDK.xdr.ScVal {
  return StellarSDK.nativeToScVal(str, { type: 'string' });
}

// Convert number to u64 ScVal
export function u64ToScVal(num: number | string): StellarSDK.xdr.ScVal {
  return StellarSDK.nativeToScVal(BigInt(num), { type: 'u64' });
}

// Convert number to i128 ScVal
export function i128ToScVal(num: number | string): StellarSDK.xdr.ScVal {
  return StellarSDK.nativeToScVal(BigInt(num), { type: 'i128' });
}

// Convert address to ScVal
export function addressToScVal(address: string): StellarSDK.xdr.ScVal {
  return new StellarSDK.Address(address).toScVal();
}

// Parse ScVal response
export function scValToNative(scVal: StellarSDK.xdr.ScVal): any {
  return StellarSDK.scValToNative(scVal);
}
