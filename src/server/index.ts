import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { SolanaService } from './services/SolanaService';
import { DatabaseService } from './services/DatabaseService';
import { TransactionMonitor } from './services/TransactionMonitor';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;
const TOKEN_ADDRESS = '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump';

// Initialize services
const dbService = new DatabaseService();
const solanaService = new SolanaService();
const transactionMonitor = new TransactionMonitor(solanaService, dbService);

app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast function for real-time updates
const broadcast = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
};

// API Routes
app.get('/api/wallets', async (_, res) => {
  try {
    const wallets = await dbService.getTopWallets();
    res.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await dbService.getRecentTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.get('/api/transactions/historical', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const transactions = await dbService.getHistoricalTransactions(hours);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching historical transactions:', error);
    res.status(500).json({ error: 'Failed to fetch historical transactions' });
  }
});

app.get('/api/export/:format', async (req, res) => {
  try {
    const format = req.params.format as 'csv' | 'json';
    const hours = parseInt(req.query.hours as string) || 24;
    
    const transactions = await dbService.getHistoricalTransactions(hours);
    
    if (format === 'csv') {
      const csv = convertToCSV(transactions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tokenwise-data.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=tokenwise-data.json');
      res.json(transactions);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Initialize services and start monitoring
async function initialize() {
  try {
    console.log('Initializing TokenWise server...');
    
    // Initialize database
    await dbService.initialize();
    console.log('Database initialized');
    
    // Fetch initial wallet data
    console.log('Fetching top wallets...');
    const wallets = await solanaService.getTopWallets(TOKEN_ADDRESS, 60);
    
    // Store wallets in database
    for (const wallet of wallets) {
      await dbService.saveWallet(wallet);
    }
    
    console.log(`Stored ${wallets.length} wallets`);
    
    // Broadcast initial wallet data
    broadcast({ type: 'wallets', wallets });
    
    // Start transaction monitoring
    console.log('Starting transaction monitoring...');
    transactionMonitor.startMonitoring(TOKEN_ADDRESS, wallets.map(w => w.address));
    
    // Set up transaction event listener
    transactionMonitor.on('transaction', (transaction) => {
      broadcast({ type: 'transaction', transaction });
    });
    
    console.log('TokenWise server initialized successfully');
  } catch (error) {
    console.error('Failed to initialize server:', error);
  }
}

server.listen(PORT, () => {
  console.log(`TokenWise server running on port ${PORT}`);
  initialize();
});