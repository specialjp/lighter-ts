import { ApiClient } from "./api-client";
import {
  TradeParams,
  OrderBookDetailsParams,
  OrderBookOrdersParams,
} from "../types";

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
  side: "buy" | "sell";
  type: "limit" | "market";
  size: string;
  price: string;
  filled_size: string;
  remaining_size: string;
  status: "open" | "filled" | "cancelled" | "rejected";
  created_at: string;
  updated_at: string;
  client_order_id?: string;
}

export interface Trade {
  id: string;
  market_id: number;
  side: "buy" | "sell";
  size: string;
  price: string;
  fee: string;
  timestamp: string;
  order_id: string;
  taker_order_id: string;
  maker_order_id: string;
}

export interface GetTradesParams {
  sortBy: string;
  limit: number;
  authorization?: string;
  auth?: string;
  marketId?: number;
  accountIndex?: number;
  orderIndex?: number;
  sortDir?: string;
  cursor?: string;
  from?: number;
  askFilter?: number;
}

export interface TradesResponse {
  code: number;
  trades: Trade[];
  cursor?: string;
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
      "/api/v1/exchangeStats"
    );
    return response.data;
  }

  public async getOrderBooks(): Promise<OrderBook[]> {
    const response = await this.client.get<OrderBook[]>("/api/v1/orderBooks");
    return response.data;
  }

  public async getOrderBookDetails(
    params?: OrderBookDetailsParams
  ): Promise<GetOrderBookDetailsResponse> {
    const response = await this.client.get<GetOrderBookDetailsResponse>(
      "/api/v1/orderBookDetails",
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
      "/api/v1/orderBookOrders",
      {
        market_id: params.market_id,
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
      }
    );
    return response.data;
  }

  public async getRecentTrades(params: TradeParams): Promise<Trade[]> {
    const response = await this.client.get<Trade[]>("/api/v1/recentTrades", {
      market_id: params.market_id,
      limit: params.limit,
    });
    return response.data;
  }

  public async getTrades(params: GetTradesParams): Promise<TradesResponse> {
    const queryParams = {
      sort_by: params.sortBy,
      limit: params.limit,
      ...(params.auth && { auth: params.auth }),
      ...(params.marketId !== undefined && { market_id: params.marketId }),
      ...(params.accountIndex !== undefined && {
        account_index: params.accountIndex,
      }),
      ...(params.orderIndex !== undefined && {
        order_index: params.orderIndex,
      }),
      ...(params.sortDir && { sort_dir: params.sortDir }),
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.from !== undefined && { from: params.from }),
      ...(params.askFilter !== undefined && { ask_filter: params.askFilter }),
    };

    const config = params.authorization
      ? { headers: { Authorization: params.authorization } }
      : undefined;

    const response = await this.client.get<TradesResponse>(
      "/api/v1/trades",
      queryParams,
      config
    );
    return response.data;
  }

  public async getAccountActiveOrders(
    accountIndex: number,
    marketId: number,
    auth?: string
  ): Promise<Order[]> {
    const response = await this.client.get<Order[]>(
      "/api/v1/accountActiveOrders",
      {
        account_index: accountIndex,
        market_id: marketId,
        ...(auth ? { auth } : {}),
      }
    );
    return response.data;
  }

  public async getAccountInactiveOrders(
    accountIndex: number,
    limit: number,
    auth?: string,
    marketId?: number,
    params?: {
      ask_filter?: number;
      between_timestamps?: string;
      cursor?: string;
    }
  ): Promise<Order[]> {
    const response = await this.client.get<Order[]>(
      "/api/v1/accountInactiveOrders",
      {
        account_index: accountIndex,
        limit: limit,
        ...(auth ? { auth } : {}),
        ...(marketId !== undefined ? { market_id: marketId } : {}),
        ...params,
      }
    );
    return response.data;
  }
}
