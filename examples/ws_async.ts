import { WsClient } from '../src/api/ws-client';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env['BASE_URL'] || 'https://mainnet.zklighter.elliot.ai';

async function main() {
  const wsUrlBase = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
  const wsUrl = `${wsUrlBase}/stream`;
  console.log(`Connecting to WebSocket: ${wsUrl}`);
  
  const client = new WsClient({
    url: wsUrl,
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket closed'),
    onError: (error) => console.error('WebSocket error:', error)
  });

  await client.connect();
  
  // Subscribe to order book updates
  client.subscribeOrderBook(0, (update) => {
    console.log('Order book[0] offset:', update.order_book.offset);
  });
  client.subscribeOrderBook(1, (update) => {
    console.log('Order book[1] top bid:', update.order_book.bids[0]);
  });
  
  // Subscribe to market stats
  client.subscribeMarketStats(0, (update) => {
    console.log('Market stats[0] index price:', update.market_stats.index_price);
  });
}

main().catch(console.error);
