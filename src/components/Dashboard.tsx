import React from 'react';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { WalletData, Transaction } from '../types';

interface DashboardProps {
  wallets: WalletData[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const recentTransactions = transactions.slice(0, 24);
  
  const buyCount = recentTransactions.filter(t => t.type === 'buy').length;
  const sellCount = recentTransactions.filter(t => t.type === 'sell').length;
  const netDirection = buyCount > sellCount ? 'buy-heavy' : sellCount > buyCount ? 'sell-heavy' : 'balanced';

  const protocolStats = recentTransactions.reduce((acc, tx) => {
    acc[tx.protocol] = (acc[tx.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const protocolData = Object.entries(protocolStats).map(([name, count]) => ({
    name,
    count,
    value: count
  }));

  const hourlyActivity = recentTransactions.reduce((acc, tx) => {
    const hour = new Date(tx.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    transactions: hourlyActivity[i] || 0
  }));

  const activeWallets = new Set(recentTransactions.map(t => t.walletAddress)).size;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stats = [
    {
      title: 'Total Transactions',
      value: recentTransactions.length,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Wallets',
      value: activeWallets,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Buy Orders',
      value: buyCount,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Sell Orders',
      value: sellCount,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Market Intelligence Dashboard</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          netDirection === 'buy-heavy' ? 'bg-green-100 text-green-800' :
          netDirection === 'sell-heavy' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          Market: {netDirection.replace('-', ' ').toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {protocolData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Buy vs Sell Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Buy', count: buyCount, fill: '#10b981' },
              { name: 'Sell', count: sellCount, fill: '#ef4444' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Activity Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip labelFormatter={(hour) => `${hour}:00`} />
            <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;