import { ApiClient } from './api-client';
import {
  TradeParams,
  CreateOrderParams,
  CancelOrderParams,
  PaginationParams,
  OrderBookDetailsParams,
  OrderBookOrdersParams,
} from '../types';

export interface OrderBook {
  market_id: number;
  bids: PriceLevel[];
  asks: PriceLevel[];
  last_update_id: string;
}

export interface PriceLevel {
  price: string;
  size: string;
}

export interface OrderBookDetail {
  symbol: string;
  market_id: number;
  status: string;
  taker_fee: string;
  maker_fee: string;
  liquidation_fee: string;
  min_base_amount: string;
  min_quote_amount: string;
  order_quote_limit: string;
  supported_size_decimals: number;
  supported_price_decimals: number;
  supported_quote_decimals: number;
  size_decimals: number;
  price_decimals: number;
  quote_multiplier: number;
  default_initial_margin_fraction: number;
  min_initial_margin_fraction: number;
  maintenance_margin_fraction: number;
  closeout_margin_fraction: number;
  last_trade_price: number;
  daily_trades_count: number;
  daily_base_token_volume: number;
  daily_quote_token_volume: number;
  daily_price_low: number;
  daily_price_high: number;
  daily_price_change: number;
  open_interest: number;
  daily_chart: any;
  market_config: {
    market_margin_mode: number;
    insurance_fund_account_index: number;
  };
}

export interface GetOrderBookDetailsResponse {
  code: number;
  order_book_details: OrderBookDetail[];
}

export interface OrderBookOrder {
  order_index: number;
  order_id: string;
  owner_account_index: number;
  initial_base_amount: string;
  remaining_base_amount: string;
  price: string;
  order_expiry: number;
}

export interface OrderBookOrdersResponse {
  code?: number;
  total_asks?: number;
  total_bids?: number;
  bids?: OrderBookOrder[];
  asks?: OrderBookOrder[];
}

export type OrderBookOrders = OrderBookOrdersResponse;

export interface Order {
  id: string;
  market_id: number;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  size: string;
  price: string;
  filled_size: string;
  remaining_size: string;
  status: 'open' | 'filled' | 'cancelled' | 'rejected';
  created_at: string;
  updated_at: string;
  client_order_id?: string;
}

export interface Trade {
  id: string;
  market_id: number;
  side: 'buy' | 'sell';
  size: string;
  price: string;
  fee: string;
  timestamp: string;
  order_id: string;
  taker_order_id: string;
  maker_order_id: string;
}

export interface ExchangeStats {
  total_volume_24h: string;
  total_trades_24h: number;
  total_orders_24h: number;
  active_markets: number;
}

export class OrderApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  public async getExchangeStats(): Promise<ExchangeStats> {
    const response = await this.client.get<ExchangeStats>(
      '/api/v1/exchangeStats'
    );
    return response.data;
  }

  public async getOrderBooks(): Promise<OrderBook[]> {
    const response = await this.client.get<OrderBook[]>('/api/v1/orderBooks');
    return response.data;
  }

  public async getOrderBookDetails(
    params?: OrderBookDetailsParams
  ): Promise<GetOrderBookDetailsResponse> {
    const response = await this.client.get<GetOrderBookDetailsResponse>(
      '/api/v1/orderBookDetails',
      params?.market_id !== undefined
        ? { market_id: params.market_id }
        : undefined
    );
    return response.data;
  }

  public async getOrderBookOrders(
    params: OrderBookOrdersParams
  ): Promise<OrderBookOrdersResponse> {
    const response = await this.client.get<OrderBookOrdersResponse>(
      '/api/v1/orderBookOrders',
      {
        market_id: params.market_id,
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
      }
    );
    return response.data;
  }

  public async getRecentTrades(params: TradeParams): Promise<Trade[]> {
    const response = await this.client.get<Trade[]>('/api/v1/recentTrades', {
      market_id: params.market_id,
      limit: params.limit,
    });
    return response.data;
  }

  public async getTrades(
    params: TradeParams & PaginationParams
  ): Promise<Trade[]> {
    const response = await this.client.get<Trade[]>('/api/v1/trades', {
      market_id: params.market_id,
      limit: params.limit,
      index: params.index,
      sort: params.sort,
    });
    return response.data;
  }

  public async getAccountActiveOrders(
    accountIndex: number,
    params?: PaginationParams
  ): Promise<Order[]> {
    const response = await this.client.get<Order[]>(
      '/api/v1/accountActiveOrders',
      {
        account_index: accountIndex,
        ...params,
      }
    );
    return response.data;
  }

  public async getAccountInactiveOrders(
    accountIndex: number,
    params?: PaginationParams
  ): Promise<Order[]> {
    const response = await this.client.get<Order[]>(
      '/api/v1/accountInactiveOrders',
      {
        account_index: accountIndex,
        ...params,
      }
    );
    return response.data;
  }

  public async createOrder(params: CreateOrderParams): Promise<Order> {
    const response = await this.client.post<Order>('/api/v1/orders', {
      market_id: params.market_id,
      side: params.side,
      type: params.type,
      size: params.size,
      price: params.price,
      reduce_only: params.reduce_only,
      post_only: params.post_only,
      time_in_force: params.time_in_force,
      client_order_id: params.client_order_id,
    });
    return response.data;
  }

  public async cancelOrder(
    params: CancelOrderParams
  ): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(
      '/api/v1/orders',
      {
        params: {
          market_id: params.market_id,
          order_id: params.order_id,
        },
      }
    );
    return response.data;
  }

  public async cancelAllOrders(
    marketId?: number
  ): Promise<{ success: boolean }> {
    const params: any = {};
    if (marketId !== undefined) {
      params.market_id = marketId;
    }

    const response = await this.client.delete<{ success: boolean }>(
      '/api/v1/orders/all',
      {
        params,
      }
    );
    return response.data;
  }
}
