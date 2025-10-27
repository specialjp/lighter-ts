import { WsClient } from '../src/api/ws-client';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env['BASE_URL'] || 'https://mainnet.zklighter.elliot.ai';

function onError(error: Error): void {
  console.error('WebSocket error:', error);
}

function onOpen(): void {
  console.log('WebSocket connected');
}

function onClose(): void {
  console.log('WebSocket disconnected');
}

async function main(): Promise<void> {
  const wsUrlBase = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
  const wsUrl = `${wsUrlBase}/stream`;
  console.log(`Connecting to WebSocket: ${wsUrl}`);
  
  const client = new WsClient({
    url: wsUrl,
    onError,
    onOpen,
    onClose,
  });

  try {
    await client.connect();
    
    // Subscribe to order book updates for market 0
    client.subscribeOrderBook(0, (update) => {
      console.log('Market 0 best bid:', update.order_book.bids[0]);
    });

    // Subscribe to market stats for market 0
    client.subscribeMarketStats(0, (update) => {
      console.log('Market 0 index price:', update.market_stats.index_price);
    });

    // Keep the connection alive
    console.log('WebSocket client running. Press Ctrl+C to exit.');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      client.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }
}

main();
