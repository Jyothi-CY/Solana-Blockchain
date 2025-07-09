import { EventEmitter } from 'events';
import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaService } from './SolanaService';
import { DatabaseService, Transaction } from './DatabaseService';

export class TransactionMonitor extends EventEmitter {
  private solanaService: SolanaService;
  private dbService: DatabaseService;
  private connection: Connection;
  private isMonitoring: boolean = false;
  private monitoredWallets: Set<string> = new Set();

  constructor(solanaService: SolanaService, dbService: DatabaseService) {
    super();
    this.solanaService = solanaService;
    this.dbService = dbService;
    this.connection = solanaService.getConnection();
  }

  async startMonitoring(tokenMint: string, walletAddresses: string[]): Promise<void> {
    if (this.isMonitoring) {
      console.log('Transaction monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoredWallets = new Set(walletAddresses);

    console.log(`Starting transaction monitoring for ${walletAddresses.length} wallets`);

    // Start generating mock transactions for development
    this.startMockTransactionGeneration();
  }

  private startMockTransactionGeneration(): void {
    const protocols = ['Jupiter', 'Raydium', 'Orca', 'Serum'];
    const walletAddresses = Array.from(this.monitoredWallets);

    const generateMockTransaction = () => {
      if (!this.isMonitoring || walletAddresses.length === 0) return;

      const transaction: Transaction = {
        id: this.generateTransactionId(),
        walletAddress: walletAddresses[Math.floor(Math.random() * walletAddresses.length)],
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.random() * 10000 + 100,
        price: Math.random() * 0.001 + 0.0001,
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        timestamp: new Date().toISOString(),
        signature: this.generateSignature(),
      };

      // Save to database
      this.dbService.saveTransaction(transaction).catch(console.error);

      // Emit event for real-time updates
      this.emit('transaction', transaction);

      console.log(`Mock transaction: ${transaction.type} ${transaction.amount.toFixed(2)} tokens via ${transaction.protocol}`);
    };

    // Generate transactions at random intervals (1-10 seconds)
    const scheduleNext = () => {
      if (this.isMonitoring) {
        const delay = Math.random() * 9000 + 1000; // 1-10 seconds
        setTimeout(() => {
          generateMockTransaction();
          scheduleNext();
        }, delay);
      }
    };

    scheduleNext();
  }

  private generateTransactionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateSignature(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.monitoredWallets.clear();
    console.log('Transaction monitoring stopped');
  }

  addWallet(address: string): void {
    this.monitoredWallets.add(address);
    console.log(`Added wallet ${address} to monitoring`);
  }

  removeWallet(address: string): void {
    this.monitoredWallets.delete(address);
    console.log(`Removed wallet ${address} from monitoring`);
  }

  getMonitoredWallets(): string[] {
    return Array.from(this.monitoredWallets);
  }

  isWalletMonitored(address: string): boolean {
    return this.monitoredWallets.has(address);
  }
}