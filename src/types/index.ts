export interface WalletData {
  address: string;
  balance: number;
  tokenAmount: number;
  rank: number;
  lastActivity?: string;
}

export interface Transaction {
  id: string;
  walletAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  protocol: string;
  timestamp: string;
  signature: string;
}

export interface ProtocolStats {
  name: string;
  count: number;
  volume: number;
}

export interface TimeFilter {
  label: string;
  value: string;
  hours: number;
}