#  TokenWise - Real-Time Wallet Intelligence on Solana

A comprehensive real-time intelligence tool for monitoring and analyzing wallet behavior for specific tokens on the Solana blockchain.

##  Features

- **Top Wallet Discovery**: Tracks the top 60 token holders with real-time balance updates
- **Real-Time Transaction Monitoring**: Live tracking of buy/sell transactions with protocol identification
- **Interactive Dashboard**: Clean, responsive interface with market trend visualization
- **Historical Analysis**: Time-filtered analysis with exportable reports (CSV/JSON)
- **Protocol Analytics**: Breakdown of DEX usage (Jupiter, Raydium, Orca, etc.)


### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend client (port 3000) concurrently.

3. **Access the application:**
- Frontend: [http://localhost:3000](http://localhost:3000/) (at port 3000)
- Backend API: http://localhost:3001 (at port 3001)

##  Architecture

### Backend (`src/server/`)
- **Express.js** server with WebSocket support for real-time updates
- **SQLite** database for persistent storage
- **Solana Web3.js** for blockchain interaction
- Modular service architecture:
  - `SolanaService`: Blockchain data fetching
  - `DatabaseService`: Data persistence
  - `TransactionMonitor`: Real-time transaction tracking

### Frontend (`src/`)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **WebSocket** client for real-time updates
- Component-based architecture with clean separation

## 📊 Dashboard Features

### 1. Market Intelligence Dashboard
- Real-time transaction statistics
- Buy/sell ratio analysis
- Protocol usage breakdown
- 24-hour activity patterns

### 2. Top Wallets View
- Ranked list of top 60 token holders
- Balance and token amount tracking
- Direct links to Solscan explorer
- Copy-to-clipboard functionality

### 3. Live Transaction Monitor
- Real-time transaction feed
- Filterable by transaction type and protocol
- Transaction details with explorer links
- Live status indicator

### 4. Historical Analysis
- Customizable time filters (1h, 6h, 24h, 7d, 30d)
- Interactive charts and graphs
- Data export functionality (CSV/JSON)
- Comprehensive transaction analytics

## 🔧 Configuration

### Target Token
The application is configured to monitor:
- **Contract Address**: `9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump`
- **Network**: Solana Mainnet

### Environment Variables
No additional environment variables required for basic functionality. The application uses public Solana RPC endpoints.

##  Project Structure

```
src/
├── components/           
│   ├── Dashboard.tsx     
│   ├── TopWallets.tsx    
│   ├── TransactionMonitor.tsx  
│   └── HistoricalAnalysis.tsx  
├── server/             
│   ├── index.ts         
│   └── services/        
│       ├── SolanaService.ts     
│       ├── DatabaseService.ts   
│       └── TransactionMonitor.ts 
├── types/               
└── App.tsx            
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run server` - Start backend server only
- `npm run client` - Start frontend client only
- `npm run build` - Build for production

## Testing Backend Endpoints

Once the backend is running on port 3001, you can test these endpoints in your browser:

Wallets: http://localhost:3001/api/wallets
Transactions: http://localhost:3001/api/transactions
Historical Data: http://localhost:3001/api/transactions/historical?hours=24

### Database

The application uses SQLite for data storage with the following tables:
- `wallets` - Top token holders data
- `transactions` - Transaction history

Database file: `tokenwise.db` (created automatically)

## Screenshots 
![image](https://github.com/user-attachments/assets/167fcb6b-9452-4c56-ba32-e26394e0920f)
![image](https://github.com/user-attachments/assets/3287731f-36f6-4e3b-8196-63f895623635)
![image](https://github.com/user-attachments/assets/c4066a1e-0a67-4d43-a1d8-c170439fd6ef)
![image](https://github.com/user-attachments/assets/0caf7ec8-5835-45bc-8ac3-d600c7fc116f)
![image](https://github.com/user-attachments/assets/6fbc3780-f823-47d8-86f8-0eec5d4dd9af)


## 📈 Data Export

Historical data can be exported in two formats:
- **CSV**: Spreadsheet-compatible format
- **JSON**: Machine-readable format

Export includes transaction details, timestamps, and protocol information.

## Future Enhancements

- Advanced wallet clustering analysis
- Price correlation tracking
- Alert system for significant movements
- Multi-token support
- Advanced filtering and search
- Mobile-responsive improvements

## Contributing

This project was built as part of a technical assessment. For production use, consider:
- Implementing proper error handling
- Adding authentication and rate limiting
- Using dedicated RPC providers
- Implementing comprehensive testing
- Adding monitoring and logging

## 📄 License

MIT License - see LICENSE file for details.

---
