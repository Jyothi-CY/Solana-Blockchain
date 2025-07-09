import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

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

export class DatabaseService {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<any>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

  constructor() {
    const dbPath = path.join(process.cwd(), 'tokenwise.db');
    this.db = new sqlite3.Database(dbPath);
    
    // Promisify database methods
    this.dbRun = promisify(this.db.run.bind(this.db));
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));
  }

  async initialize(): Promise<void> {
    try {
      // Create wallets table
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS wallets (
          address TEXT PRIMARY KEY,
          balance REAL NOT NULL,
          token_amount REAL NOT NULL,
          rank INTEGER NOT NULL,
          last_activity TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create transactions table
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          wallet_address TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
          amount REAL NOT NULL,
          price REAL NOT NULL,
          protocol TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          signature TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (wallet_address) REFERENCES wallets (address)
        )
      `);

      // Create indexes for better performance
      await this.dbRun('CREATE INDEX IF NOT EXISTS idx_wallets_rank ON wallets (rank)');
      await this.dbRun('CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions (timestamp)');
      await this.dbRun('CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_address)');

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async saveWallet(wallet: WalletData): Promise<void> {
    try {
      await this.dbRun(`
        INSERT OR REPLACE INTO wallets 
        (address, balance, token_amount, rank, last_activity, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        wallet.address,
        wallet.balance,
        wallet.tokenAmount,
        wallet.rank,
        wallet.lastActivity
      ]);
    } catch (error) {
      console.error('Error saving wallet:', error);
      throw error;
    }
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      await this.dbRun(`
        INSERT OR REPLACE INTO transactions 
        (id, wallet_address, type, amount, price, protocol, timestamp, signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transaction.id,
        transaction.walletAddress,
        transaction.type,
        transaction.amount,
        transaction.price,
        transaction.protocol,
        transaction.timestamp,
        transaction.signature
      ]);
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async getTopWallets(limit: number = 60): Promise<WalletData[]> {
    try {
      const rows = await this.dbAll(`
        SELECT address, balance, token_amount as tokenAmount, rank, last_activity as lastActivity
        FROM wallets 
        ORDER BY rank ASC 
        LIMIT ?
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error fetching top wallets:', error);
      return [];
    }
  }

  async getRecentTransactions(limit: number = 100): Promise<Transaction[]> {
    try {
      const rows = await this.dbAll(`
        SELECT id, wallet_address as walletAddress, type, amount, price, protocol, timestamp, signature
        FROM transactions 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  async getHistoricalTransactions(hours: number): Promise<Transaction[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const rows = await this.dbAll(`
        SELECT id, wallet_address as walletAddress, type, amount, price, protocol, timestamp, signature
        FROM transactions 
        WHERE timestamp >= ?
        ORDER BY timestamp DESC
      `, [cutoffTime]);

      return rows;
    } catch (error) {
      console.error('Error fetching historical transactions:', error);
      return [];
    }
  }

  async getWalletActivity(address: string, hours: number = 24): Promise<Transaction[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const rows = await this.dbAll(`
        SELECT id, wallet_address as walletAddress, type, amount, price, protocol, timestamp, signature
        FROM transactions 
        WHERE wallet_address = ? AND timestamp >= ?
        ORDER BY timestamp DESC
      `, [address, cutoffTime]);

      return rows;
    } catch (error) {
      console.error('Error fetching wallet activity:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}