# WsClient

The `WsClient` class provides real-time WebSocket connectivity for order book updates, account changes, and other live data from the Lighter Protocol.

## Constructor

```typescript
new WsClient(config: WsConfig)
```

### WsConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | `string` | Yes | WebSocket URL (e.g., `wss://mainnet.zklighter.elliot.ai/stream`) |
| `reconnectInterval` | `number` | No | Reconnection interval in ms (default: 5000) |
| `maxReconnectAttempts` | `number` | No | Maximum reconnection attempts (default: 10) |
| `onOpen` | `() => void` | No | Callback invoked on connection open |
| `onClose` | `() => void` | No | Callback invoked when the socket closes |
| `onError` | `(error: Error) => void` | No | Callback invoked on socket errors |
| `onMessage` | `(message: any) => void` | No | Receives every raw message before typed handlers run |

## Methods

### connect()

Establishes a WebSocket connection to the Lighter server.

```typescript
await wsClient.connect();
```

### disconnect()

Closes the WebSocket connection.

```typescript
await wsClient.disconnect();
```

### subscribeOrderBook(marketIndex: number, callback: (data: WsOrderBookUpdate) => void)

Subscribes to order book updates for a specific market.

**Parameters:**
- `marketIndex: number` - Market index (0 for ETH/USDC)
- `callback: (data: WsOrderBookUpdate) => void` - Callback function invoked with the raw order book update

**Example:**
```typescript
wsClient.subscribeOrderBook(0, (update) => {
  console.log('ETH/USDC order book offset:', update.order_book.offset);
  console.log('Top ask:', update.order_book.asks[0]);
  console.log('Top bid:', update.order_book.bids[0]);
});
```

### subscribeAccountAll(accountId: number, callback: (data: WsAccountAllUpdate) => void)

Subscribes to account-wide updates for all markets.

**Parameters:**
- `accountId: number` - Account index
- `callback: (data: WsAccountAllUpdate) => void` - Callback function for account updates

**Example:**
```typescript
wsClient.subscribeAccountAll(10, (update) => {
  console.log('Account total volume:', update.total_volume);
  console.log('Positions by market:', Object.keys(update.positions));
});
```

### subscribeTrades(marketIndex: number, callback: (data: WsTradeUpdate) => void)

Subscribes to trade updates for a specific market.

**Parameters:**
- `marketIndex: number` - Market index
- `callback: (data: WsTradeUpdate) => void` - Callback function for trade updates

**Example:**
```typescript
wsClient.subscribeTrades(0, (update) => {
  console.log('Trades:', update.trades);
});
```

### send(message: any)

Sends a raw JSON-serialisable payload over the socket. This is rarely needed when using the typed helpers, but it remains available for custom channels.

```typescript
wsClient.send({ type: 'PING', timestamp: Date.now() });
```

## Event Handling

The WebSocket client emits events for connection status:

```typescript
wsClient.on('connected', () => {
  console.log('WebSocket connected');
});

wsClient.on('disconnected', () => {
  console.log('WebSocket disconnected');
});

wsClient.on('error', (error) => {
  console.error('WebSocket error:', error);
});

wsClient.on('reconnecting', (attempt) => {
  console.log(`Reconnecting... attempt ${attempt}`);
});
```

## Types

See `Ws*` typings exported from the SDK for detailed shapes.

## Complete Example

```typescript
import { WsClient } from '@specialjp/lighter-sdk';

async function main() {
  const wsClient = new WsClient({
    url: 'wss://mainnet.zklighter.elliot.ai/stream',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });

  // Set up event handlers
  wsClient.on('connected', () => {
    console.log('WebSocket connected');
  });

  wsClient.on('disconnected', () => {
    console.log('WebSocket disconnected');
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  try {
    // Connect to WebSocket
    await wsClient.connect();

    // Subscribe to order book updates
    wsClient.subscribeOrderBook(0, (update) => {
      console.log('ETH/USDC Order Book offset:', update.order_book.offset);
      console.log('Top ask:', update.order_book.asks[0]);
      console.log('Top bid:', update.order_book.bids[0]);
    });

    // Subscribe to market stats
    wsClient.subscribeMarketStats(0, (update) => {
      console.log('Market stats index price:', update.market_stats.index_price);
    });

    // Subscribe to trade updates
    wsClient.subscribeTrades(0, (update) => {
      const latest = update.trades[0];
      console.log('Latest trade:', latest);
    });

    // Keep the connection alive
    await new Promise(() => {}); // Keep running

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await wsClient.disconnect();
  }
}

main().catch(console.error);
```

## Error Handling

The WebSocket client includes automatic reconnection and error handling:

```typescript
wsClient.on('error', (error) => {
  console.error('WebSocket error:', error);
  // The client will automatically attempt to reconnect
});

wsClient.on('reconnecting', (attempt) => {
  console.log(`Reconnection attempt ${attempt}/${wsClient.maxReconnectAttempts}`);
});
```

## Best Practices

1. **Always handle connection events** - Monitor connection status
2. **Use appropriate callbacks** - Keep callback functions lightweight
3. **Handle errors gracefully** - The client will auto-reconnect, but you should handle errors
4. **Clean up resources** - Always call `disconnect()` when done
5. **Monitor performance** - WebSocket connections can generate high-frequency updates

## Limitations

- WebSocket connections are not persistent across browser refreshes
- Rate limiting may apply to high-frequency subscriptions
- Some data may be delayed during high network congestion
- Connection will be lost if the server restarts
