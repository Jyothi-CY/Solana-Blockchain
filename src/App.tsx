import { useState, useEffect } from 'react';
import { Activity, Wallet, TrendingUp, Database } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TopWallets from './components/TopWallets';
import TransactionMonitor from './components/TransactionMonitor';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import { WalletData, Transaction } from './types';

const TOKEN_ADDRESS = '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3001/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to TokenWise server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'transaction') {
        setTransactions(prev => [data.transaction, ...prev.slice(0, 99)]);
      } else if (data.type === 'wallets') {
        setWallets(data.wallets);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from TokenWise server');
    };

    // Fetch initial data
    fetchWallets();
    fetchTransactions();

    return () => ws.close();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets');
      const data = await response.json();
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'wallets', label: 'Top Wallets', icon: Wallet },
    { id: 'monitor', label: 'Live Monitor', icon: Activity },
    { id: 'history', label: 'Historical', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TokenWise</h1>
                <p className="text-sm text-gray-500">Solana Wallet Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Token: {TOKEN_ADDRESS.slice(0, 8)}...{TOKEN_ADDRESS.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard wallets={wallets} transactions={transactions} />
        )}
        {activeTab === 'wallets' && (
          <TopWallets wallets={wallets} />
        )}
        {activeTab === 'monitor' && (
          <TransactionMonitor transactions={transactions} />
        )}
        {activeTab === 'history' && (
          <HistoricalAnalysis />
        )}
      </main>
    </div>
  );
}

export default App;