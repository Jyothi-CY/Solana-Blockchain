import React, { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Transaction, TimeFilter } from '../types';

const HistoricalAnalysis: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>({
    label: '24 Hours',
    value: '24h',
    hours: 24
  });
  const [historicalData, setHistoricalData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const timeFilters: TimeFilter[] = [
    { label: '1 Hour', value: '1h', hours: 1 },
    { label: '6 Hours', value: '6h', hours: 6 },
    { label: '24 Hours', value: '24h', hours: 24 },
    { label: '7 Days', value: '7d', hours: 168 },
    { label: '30 Days', value: '30d', hours: 720 }
  ];

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedFilter]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/historical?hours=${selectedFilter.hours}`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/export/${format}?hours=${selectedFilter.hours}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tokenwise-data-${selectedFilter.value}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Process data for charts
  const processTimeSeriesData = () => {
    const hourlyData: Record<string, { buys: number; sells: number; volume: number }> = {};
    
    historicalData.forEach(tx => {
      const hour = new Date(tx.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      if (!hourlyData[hour]) {
        hourlyData[hour] = { buys: 0, sells: 0, volume: 0 };
      }
      
      if (tx.type === 'buy') {
        hourlyData[hour].buys++;
      } else {
        hourlyData[hour].sells++;
      }
      hourlyData[hour].volume += tx.amount;
    });

    return Object.entries(hourlyData)
      .map(([time, data]) => ({
        time: new Date(time).toLocaleString(),
        buys: data.buys,
        sells: data.sells,
        volume: data.volume
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const processProtocolData = () => {
    const protocolStats: Record<string, { count: number; volume: number }> = {};
    
    historicalData.forEach(tx => {
      if (!protocolStats[tx.protocol]) {
        protocolStats[tx.protocol] = { count: 0, volume: 0 };
      }
      protocolStats[tx.protocol].count++;
      protocolStats[tx.protocol].volume += tx.amount;
    });

    return Object.entries(protocolStats).map(([protocol, stats]) => ({
      protocol,
      transactions: stats.count,
      volume: stats.volume
    }));
  };

  const timeSeriesData = processTimeSeriesData();
  const protocolData = processProtocolData();

  const totalBuys = historicalData.filter(tx => tx.type === 'buy').length;
  const totalSells = historicalData.filter(tx => tx.type === 'sell').length;
  const totalVolume = historicalData.reduce((sum, tx) => sum + tx.amount, 0);
  const activeWallets = new Set(historicalData.map(tx => tx.walletAddress)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Historical Analysis</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedFilter.value}
              onChange={(e) => {
                const filter = timeFilters.find(f => f.value === e.target.value);
                if (filter) setSelectedFilter(filter);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {timeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportData('csv')}
              className="btn-secondary flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => exportData('json')}
              className="btn-secondary flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading historical data...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{historicalData.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Buy/Sell Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSells > 0 ? (totalBuys / totalSells).toFixed(2) : '∞'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Wallets</p>
                  <p className="text-2xl font-bold text-gray-900">{activeWallets}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-50">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalVolume >= 1e6 ? (totalVolume / 1e6).toFixed(2) + 'M' : 
                     totalVolume >= 1e3 ? (totalVolume / 1e3).toFixed(2) + 'K' : 
                     totalVolume.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="buys" stroke="#10b981" strokeWidth={2} name="Buys" />
                  <Line type="monotone" dataKey="sells" stroke="#ef4444" strokeWidth={2} name="Sells" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Usage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={protocolData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="protocol" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalAnalysis;