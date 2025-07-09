import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, ExternalLink, Filter } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionMonitorProps {
  transactions: Transaction[];
}

const TransactionMonitor: React.FC<TransactionMonitorProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');

  const protocols = Array.from(new Set(transactions.map(t => t.protocol)));
  
  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filter === 'all' || tx.type === filter;
    const protocolMatch = protocolFilter === 'all' || tx.protocol === protocolFilter;
    return typeMatch && protocolMatch;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Transaction Monitor</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'buy' | 'sell')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>

          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Protocols</option>
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No transactions match the current filters</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 rounded-lg border-l-4 ${
                  tx.type === 'buy' 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          tx.type === 'buy' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {tx.type.toUpperCase()}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="font-mono text-sm text-gray-600">
                          {formatAddress(tx.walletAddress)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(tx.amount)} tokens • ${tx.price.toFixed(6)} • via {tx.protocol}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                    <a
                      href={`https://solscan.io/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View transaction"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitor;