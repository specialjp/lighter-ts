import WebSocket from 'ws';
import {
  WebSocketConfig,
  WebSocketSubscription,
  WsOrderBookUpdate,
  WsMarketStatsUpdate,
  WsTradeUpdate,
  WsAccountAllUpdate,
  WsAccountMarketUpdate,
  WsUserStatsUpdate,
  WsTransactionUpdate,
  WsHeightUpdate,
  WsPoolDataUpdate,
  WsPoolInfoUpdate,
  WsNotificationUpdate,
  WsAccountAllOrdersUpdate,
  WsAccountOrdersUpdate,
  WsAccountAllTradesUpdate,
  WsAccountAllPositionsUpdate,
} from '../types';

export class WsClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, WebSocketSubscription<any>> = new Map();
  private isConnecting = false;
  private isConnected = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...config,
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws!.on('open', () => {
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.config.onOpen?.();

          // Resubscribe to all channels
          this.resubscribeAll();
          resolve();
        });

        this.ws!.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.config.onMessage?.(message);
            this.handleSubscriptionMessage(message);
          } catch (error) {
            // Silently ignore parse errors
          }
        });

        this.ws!.on('error', (error: Error) => {
          this.isConnecting = false;
          this.config.onError?.(error);
          reject(error);
        });

        this.ws!.on('close', () => {
          this.isConnected = false;
          this.config.onClose?.();
          this.attemptReconnect();
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
  }

  public subscribe<TPayload = any>(subscription: WebSocketSubscription<TPayload>): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    // Use the same format as send() method for consistency
    const message: any = {
      type: 'subscribe',
      channel: subscription.channel,
    };

    if (subscription.auth) {
      message.auth = subscription.auth;
    }

    if (subscription.params) {
      for (const [key, value] of Object.entries(subscription.params)) {
        if (value !== undefined) {
          message[key] = value;
        }
      }
    }

    const normalizedChannel = this.normalizeChannel(subscription.channel);
    const storedSubscription: WebSocketSubscription<any> = { ...subscription };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.set(normalizedChannel, storedSubscription);
  }

  public subscribeOrderBook(marketIndex: number, handler: (update: WsOrderBookUpdate) => void): void {
    this.subscribe<WsOrderBookUpdate>({
      channel: `order_book/${marketIndex}`,
      handler,
      parser: this.passthroughParser<WsOrderBookUpdate>(),
    });
  }

  public unsubscribeOrderBook(marketIndex: number): void {
    this.unsubscribe(`order_book/${marketIndex}`);
  }

  public subscribeMarketStats(market: number | 'all', handler: (update: WsMarketStatsUpdate) => void): void {
    const channel = `market_stats/${market}`;
    this.subscribe<WsMarketStatsUpdate>({
      channel,
      handler,
      parser: this.passthroughParser<WsMarketStatsUpdate>(),
    });
  }

  public unsubscribeMarketStats(market: number | 'all'): void {
    this.unsubscribe(`market_stats/${market}`);
  }

  public subscribeTrades(marketIndex: number, handler: (update: WsTradeUpdate) => void): void {
    this.subscribe<WsTradeUpdate>({
      channel: `trade/${marketIndex}`,
      handler,
      parser: this.passthroughParser<WsTradeUpdate>(),
    });
  }

  public unsubscribeTrades(marketIndex: number): void {
    this.unsubscribe(`trade/${marketIndex}`);
  }

  public subscribeAccountAll(accountId: number, handler: (update: WsAccountAllUpdate) => void): void {
    this.subscribe<WsAccountAllUpdate>({
      channel: `account_all/${accountId}`,
      handler,
      parser: this.passthroughParser<WsAccountAllUpdate>(),
    });
  }

  public unsubscribeAccountAll(accountId: number): void {
    this.unsubscribe(`account_all/${accountId}`);
  }

  public subscribeAccountMarket(
    marketId: number,
    accountId: number,
    auth: string,
    handler: (update: WsAccountMarketUpdate) => void
  ): void {
    this.subscribe<WsAccountMarketUpdate>({
      channel: `account_market/${marketId}/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsAccountMarketUpdate>(),
    });
  }

  public unsubscribeAccountMarket(marketId: number, accountId: number): void {
    this.unsubscribe(`account_market/${marketId}/${accountId}`);
  }

  public subscribeUserStats(accountId: number, handler: (update: WsUserStatsUpdate) => void): void {
    this.subscribe<WsUserStatsUpdate>({
      channel: `user_stats/${accountId}`,
      handler,
      parser: this.passthroughParser<WsUserStatsUpdate>(),
    });
  }

  public unsubscribeUserStats(accountId: number): void {
    this.unsubscribe(`user_stats/${accountId}`);
  }

  public subscribeTransactions(handler: (update: WsTransactionUpdate) => void): void {
    this.subscribe<WsTransactionUpdate>({
      channel: 'transaction',
      handler,
      parser: this.passthroughParser<WsTransactionUpdate>(),
    });
  }

  public unsubscribeTransactions(): void {
    this.unsubscribe('transaction');
  }

  public subscribeExecutedTransactions(handler: (update: WsTransactionUpdate) => void): void {
    this.subscribe<WsTransactionUpdate>({
      channel: 'executed_transaction',
      handler,
      parser: this.passthroughParser<WsTransactionUpdate>(),
    });
  }

  public unsubscribeExecutedTransactions(): void {
    this.unsubscribe('executed_transaction');
  }

  public subscribeAccountTransactions(
    accountId: number,
    auth: string,
    handler: (update: WsTransactionUpdate) => void
  ): void {
    this.subscribe<WsTransactionUpdate>({
      channel: `account_tx/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsTransactionUpdate>(),
    });
  }

  public unsubscribeAccountTransactions(accountId: number): void {
    this.unsubscribe(`account_tx/${accountId}`);
  }

  public subscribeAccountAllOrders(
    accountId: number,
    auth: string,
    handler: (update: WsAccountAllOrdersUpdate) => void
  ): void {
    this.subscribe<WsAccountAllOrdersUpdate>({
      channel: `account_all_orders/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsAccountAllOrdersUpdate>(),
    });
  }

  public unsubscribeAccountAllOrders(accountId: number): void {
    this.unsubscribe(`account_all_orders/${accountId}`);
  }

  public subscribeHeight(handler: (update: WsHeightUpdate) => void): void {
    this.subscribe<WsHeightUpdate>({
      channel: 'height',
      handler,
      parser: this.passthroughParser<WsHeightUpdate>(),
    });
  }

  public unsubscribeHeight(): void {
    this.unsubscribe('height');
  }

  public subscribePoolData(
    accountId: number,
    auth: string,
    handler: (update: WsPoolDataUpdate) => void
  ): void {
    this.subscribe<WsPoolDataUpdate>({
      channel: `pool_data/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsPoolDataUpdate>(),
    });
  }

  public unsubscribePoolData(accountId: number): void {
    this.unsubscribe(`pool_data/${accountId}`);
  }

  public subscribePoolInfo(
    accountId: number,
    auth: string,
    handler: (update: WsPoolInfoUpdate) => void
  ): void {
    this.subscribe<WsPoolInfoUpdate>({
      channel: `pool_info/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsPoolInfoUpdate>(),
    });
  }

  public unsubscribePoolInfo(accountId: number): void {
    this.unsubscribe(`pool_info/${accountId}`);
  }

  public subscribeNotifications(
    accountId: number,
    auth: string,
    handler: (update: WsNotificationUpdate) => void
  ): void {
    this.subscribe<WsNotificationUpdate>({
      channel: `notification/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsNotificationUpdate>(),
    });
  }

  public unsubscribeNotifications(accountId: number): void {
    this.unsubscribe(`notification/${accountId}`);
  }

  public subscribeAccountOrders(
    marketIndex: number,
    accountId: number,
    auth: string,
    handler: (update: WsAccountOrdersUpdate) => void
  ): void {
    this.subscribe<WsAccountOrdersUpdate>({
      channel: `account_orders/${marketIndex}/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsAccountOrdersUpdate>(),
    });
  }

  public unsubscribeAccountOrders(marketIndex: number, accountId: number): void {
    this.unsubscribe(`account_orders/${marketIndex}/${accountId}`);
  }

  public subscribeAccountAllTrades(
    accountId: number,
    auth: string,
    handler: (update: WsAccountAllTradesUpdate) => void
  ): void {
    this.subscribe<WsAccountAllTradesUpdate>({
      channel: `account_all_trades/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsAccountAllTradesUpdate>(),
    });
  }

  public unsubscribeAccountAllTrades(accountId: number): void {
    this.unsubscribe(`account_all_trades/${accountId}`);
  }

  public subscribeAccountAllPositions(
    accountId: number,
    auth: string,
    handler: (update: WsAccountAllPositionsUpdate) => void
  ): void {
    this.subscribe<WsAccountAllPositionsUpdate>({
      channel: `account_all_positions/${accountId}`,
      auth,
      handler,
      parser: this.passthroughParser<WsAccountAllPositionsUpdate>(),
    });
  }

  public unsubscribeAccountAllPositions(accountId: number): void {
    this.unsubscribe(`account_all_positions/${accountId}`);
  }

  public unsubscribe(channel: string): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    // Use the same format as send() method for consistency
    const message = {
      type: 'unsubscribe',
      channel,
    };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.delete(this.normalizeChannel(channel));
  }

  public send(message: any): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  private normalizeChannel(channel: string): string {
    return channel.replace(/:/g, '/');
  }

  private passthroughParser<T>(): (payload: any) => T {
    return (payload: any) => payload as T;
  }

  private handleSubscriptionMessage(rawMessage: any): void {
    if (!rawMessage || typeof rawMessage !== 'object') {
      return;
    }

    const channelName = typeof rawMessage.channel === 'string' ? rawMessage.channel : undefined;
    if (!channelName) {
      return;
    }

    const normalizedChannel = this.normalizeChannel(channelName);
    const subscription = this.subscriptions.get(normalizedChannel);

    if (!subscription || typeof subscription.handler !== 'function') {
      return;
    }

    try {
      const parser =
        typeof subscription.parser === 'function'
          ? subscription.parser
          : (payload: any) => payload;
      const parsed = parser(rawMessage);
      subscription.handler(parsed);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      this.config.onError?.(normalizedError);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      return;
    }

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnect();
      });
    }, this.config.reconnectInterval || 5000);
  }

  private resubscribeAll(): void {
    const subscriptions = Array.from(this.subscriptions.values());
    for (const subscription of subscriptions) {
      this.subscribe(subscription);
    }
  }

  public isConnectedToWebSocket(): boolean {
    return this.isConnected;
  }

  public getSubscriptions(): WebSocketSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}
