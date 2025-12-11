/**
 * Example: Basic WebSocket Connection
 * Demonstrates basic WebSocket connection and subscription to order book data
 */

import { WsClient } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env['BASE_URL'] || 'https://mainnet.zklighter.elliot.ai';

async function basicWebSocketExample() {
  console.log('🚀 Basic WebSocket Connection Example...\n');

  // Validate BASE_URL format
  if (!BASE_URL.match(/^https?:\/\//)) {
    throw new Error('BASE_URL must start with http:// or https://');
  }

  const wsUrlBase = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
  const wsUrl = `${wsUrlBase}/stream`;
  console.log(`Connecting to WebSocket: ${wsUrl}\n`);

  // Initialize WebSocket client
  const wsClient = new WsClient({
    url: wsUrl,
    onOpen: () => console.log('✅ WebSocket connected'),
    onMessage: (_message) => {
      // Optional: log all raw messages
      // console.log('📡 Message received:', _message);
    },
    onClose: () => console.log('🔌 WebSocket closed'),
    onError: (error) => console.error('❌ WebSocket error:', error)
  });

  try {
    // Connect to WebSocket
    await wsClient.connect();

    // Wait for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Subscribe to order book updates for market 0 (ETH)
    wsClient.subscribeOrderBook(0, (update) => {
      const bestBid = update.order_book.bids[0];
      const bestAsk = update.order_book.asks[0];
      console.log(`📊 Order Book - Best Bid: ${bestBid?.price}, Best Ask: ${bestAsk?.price}`);
    });
    console.log('✅ Subscribed to order book for market 0 (ETH)\n');

    // Subscribe to market stats for market 0 (ETH)
    wsClient.subscribeMarketStats(0, (update) => {
      console.log(`📈 Market Stats - Index Price: ${update.market_stats.index_price}, Mark Price: ${update.market_stats.mark_price}`);
    });
    console.log('✅ Subscribed to market stats for market 0 (ETH)\n');

    // Subscribe to trades for market 0 (ETH)
    wsClient.subscribeTrades(0, (update) => {
      const latestTrade = update.trades[0];
      if (latestTrade) {
        console.log(`💱 Trade - Size: ${latestTrade.size}, Price: ${latestTrade.price}`);
      }
    });
    console.log('✅ Subscribed to trades for market 0 (ETH)\n');

    // Keep connection alive for 30 seconds
    console.log('📡 Listening for updates... (will auto-disconnect in 30 seconds)');
    setTimeout(() => {
      wsClient.disconnect();
      console.log('\n🎉 WebSocket example completed!');
    }, 30000);

  } catch (error) {
    console.error('❌ Error:', error);
    wsClient.disconnect();
  }
}

// Run the example
if (require.main === module) {
  basicWebSocketExample().catch(console.error);
}

export { basicWebSocketExample };
