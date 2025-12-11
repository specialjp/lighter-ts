export interface Configuration {
  host: string;
  apiKey?: string;
  secretKey?: string;
  timeout?: number;
  userAgent?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginationParams {
  index?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface CursorParams {
  cursor?: string;
  limit?: number;
}

export interface AccountParams {
  by: string;
  value: string;
}

export interface BlockParams {
  by: 'height' | 'hash';
  value: string;
}

export interface TransactionParams {
  by: 'sequence_index' | 'hash' | 'l1_tx_hash';
  value: string;
}

export interface CandlestickParams {
  market_id: number;
  resolution: string;
  start_timestamp?: number;
  end_timestamp?: number;
  count_back?: number;
}

export interface OrderBookDetailsParams {
  market_id?: number;
}

export interface OrderBookOrdersParams {
  market_id: number;
  limit?: number;
}

export type OrderBookParams = OrderBookOrdersParams;

export interface TradeParams {
  market_id: number;
  limit?: number;
}

export interface CreateOrderParams {
  market_id: number;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  size: string;
  price?: string;
  reduce_only?: boolean;
  post_only?: boolean;
  time_in_force?: 'GTC' | 'IOC' | 'FOK';
  client_order_id?: string;
}

export interface SendTransactionParams {
  account_index: number;
  api_key_index: number;
  transaction: string;
}

export interface SendTransactionBatchParams {
  account_index?: number;
  api_key_index?: number;
  transactions?: string[];
  tx_types?: string; // JSON stringified array of transaction types
  tx_infos?: string; // JSON stringified array of transaction infos
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export interface WebSocketSubscription<TPayload = any> {
  channel: string;
  auth?: string;
  params?: Record<string, any>;
  parser?: (payload: any) => TPayload;
  handler?: (payload: TPayload) => void;
}

export interface WsPriceLevel {
  price: string;
  size: string;
}

export interface WsOrderBookSnapshot {
  code: number;
  asks: WsPriceLevel[];
  bids: WsPriceLevel[];
  offset: number;
}

export interface WsOrderBookUpdate {
  channel: string;
  offset: number;
  order_book: WsOrderBookSnapshot;
  type: 'update/order_book';
}

export interface WsMarketStats {
  market_id: number;
  index_price: string;
  mark_price: string;
  open_interest: string;
  last_trade_price: string;
  current_funding_rate: string;
  funding_rate: string;
  funding_timestamp: number;
  daily_base_token_volume: number;
  daily_quote_token_volume: number;
  daily_price_low: number;
  daily_price_high: number;
  daily_price_change: number;
}

export interface WsMarketStatsUpdate {
  channel: string;
  market_stats: WsMarketStats;
  type: 'update/market_stats';
}

export interface WsTrade {
  trade_id: number;
  tx_hash: string;
  type: string;
  market_id: number;
  size: string;
  price: string;
  usd_amount: string;
  ask_id: number;
  bid_id: number;
  ask_account_id: number;
  bid_account_id: number;
  is_maker_ask: boolean;
  block_height: number;
  timestamp: number;
  taker_fee?: number;
  taker_position_size_before?: string;
  taker_entry_quote_before?: string;
  taker_initial_margin_fraction_before?: number;
  taker_position_sign_changed?: boolean;
  maker_fee?: number;
  maker_position_size_before?: string;
  maker_entry_quote_before?: string;
  maker_initial_margin_fraction_before?: number;
  maker_position_sign_changed?: boolean;
}

export interface WsTradeUpdate {
  channel: string;
  trades: WsTrade[];
  type: 'update/trade';
}

export interface WsOrder {
  order_index: number;
  client_order_index: number;
  order_id: string;
  client_order_id: string;
  market_index: number;
  owner_account_index: number;
  initial_base_amount: string;
  price: string;
  nonce: number;
  remaining_base_amount: string;
  is_ask: boolean;
  base_size: number;
  base_price: number;
  filled_base_amount: string;
  filled_quote_amount: string;
  side: string;
  type: string;
  time_in_force: string;
  reduce_only: boolean;
  trigger_price: string;
  order_expiry: number;
  status: string;
  trigger_status: string;
  trigger_time: number;
  parent_order_index: number;
  parent_order_id: string;
  to_trigger_order_id_0?: string;
  to_trigger_order_id_1?: string;
  to_cancel_order_id_0?: string;
  to_cancel_order_id_1?: string;
  block_height: number;
  timestamp: number;
}

export interface WsFundingHistoryEntry {
  timestamp: number;
  market_id: number;
  funding_id: number;
  change: string;
  rate: string;
  position_size: string;
  position_side: string;
}

export interface WsAccountPosition {
  market_id: number;
  symbol: string;
  initial_margin_fraction: string;
  open_order_count: number;
  pending_order_count: number;
  position_tied_order_count: number;
  sign: number;
  position: string;
  avg_entry_price: string;
  position_value: string;
  unrealized_pnl: string;
  realized_pnl: string;
  liquidation_price: string;
  total_funding_paid_out?: string;
  margin_mode: number;
  allocated_margin: string;
}

export interface WsPoolShare {
  public_pool_index: number;
  shares_amount: number;
  entry_usdc: string;
}

export interface WsAccountAllUpdate {
  account: number;
  channel: string;
  daily_trades_count: number;
  daily_volume: number;
  weekly_trades_count: number;
  weekly_volume: number;
  monthly_trades_count: number;
  monthly_volume: number;
  total_trades_count: number;
  total_volume: number;
  funding_histories: Record<string, WsFundingHistoryEntry[]>;
  positions: Record<string, WsAccountPosition>;
  shares: WsPoolShare[];
  trades: Record<string, WsTrade[]>;
  type: 'update/account_all';
}

export interface WsAccountMarketUpdate {
  account: number;
  channel: string;
  funding_history?: WsFundingHistoryEntry;
  orders: WsOrder[];
  position?: WsAccountPosition;
  trades: WsTrade[];
  type: 'update/account_market';
}

export interface WsStatsBreakdown {
  collateral: string;
  portfolio_value: string;
  leverage: string;
  available_balance: string;
  margin_usage: string;
  buying_power: string;
}

export interface WsUserStats {
  collateral: string;
  portfolio_value: string;
  leverage: string;
  available_balance: string;
  margin_usage: string;
  buying_power: string;
  cross_stats: WsStatsBreakdown;
  total_stats: WsStatsBreakdown;
}

export interface WsUserStatsUpdate {
  channel: string;
  stats: WsUserStats;
  type: 'update/user_stats';
}

export interface WsTransaction {
  hash: string;
  type: number;
  info: string;
  event_info: string;
  status: number;
  transaction_index: number;
  l1_address: string;
  account_index: number;
  nonce: number;
  expire_at: number;
  block_height: number;
  queued_at: number;
  executed_at: number;
  sequence_index: number;
  parent_hash: string;
}

export interface WsTransactionUpdate {
  channel: string;
  txs: WsTransaction[];
  type: 'update/transaction';
}

export interface WsHeightUpdate {
  channel: string;
  height: number;
  type: 'update/height';
}

export interface WsPositionFunding {
  timestamp: number;
  market_id: number;
  funding_id: number;
  change: string;
  rate: string;
  position_size: string;
  position_side: string;
}

export interface WsPoolDataUpdate {
  channel: string;
  account: number;
  trades: Record<string, WsTrade[]>;
  orders: Record<string, WsOrder[]>;
  positions: Record<string, WsAccountPosition>;
  shares: WsPoolShare[];
  funding_histories: Record<string, WsPositionFunding[]>;
  type: 'subscribed/pool_data' | 'update/pool_data';
}

export interface WsPoolInfoDailyMetric {
  timestamp: number;
  daily_return?: number;
  share_price?: number;
}

export interface WsPoolInfo {
  status: number;
  operator_fee: string;
  min_operator_share_rate: string;
  total_shares: number;
  operator_shares: number;
  annual_percentage_yield: number;
  daily_returns: WsPoolInfoDailyMetric[];
  share_prices: WsPoolInfoDailyMetric[];
}

export interface WsPoolInfoUpdate {
  channel: string;
  pool_info: WsPoolInfo;
  type: 'subscribed/pool_info' | 'update/pool_info';
}

export interface WsNotificationBase {
  id: string;
  created_at: string;
  updated_at: string;
  kind: string;
  account_index: number;
  ack: boolean;
  acked_at: string | null;
}

export interface WsLiquidationNotificationContent {
  id: string;
  is_ask: boolean;
  usdc_amount: string;
  size: string;
  market_index: number;
  price: string;
  timestamp: number;
  avg_price: string;
}

export interface WsDeleverageNotificationContent {
  id: string;
  usdc_amount: string;
  size: string;
  market_index: number;
  settlement_price: string;
  timestamp: number;
}

export interface WsAnnouncementNotificationContent {
  title: string;
  content: string;
  created_at: number;
}

export type WsNotificationContent =
  | WsLiquidationNotificationContent
  | WsDeleverageNotificationContent
  | WsAnnouncementNotificationContent
  | Record<string, any>;

export interface WsNotification extends WsNotificationBase {
  content: WsNotificationContent;
}

export interface WsNotificationUpdate {
  channel: string;
  notifs: WsNotification[];
  type: 'subscribed/notification' | 'update/notification';
}

export interface WsAccountAllOrdersUpdate {
  channel: string;
  orders: Record<string, WsOrder[]>;
  type: 'update/account_all_orders';
}

export interface WsAccountOrdersUpdate {
  account: number;
  channel: string;
  nonce?: number;
  orders: Record<string, WsOrder[]>;
  type: 'update/account_orders';
}

export interface WsAccountAllTradesUpdate {
  channel: string;
  trades: Record<string, WsTrade[]>;
  total_volume: number;
  monthly_volume: number;
  weekly_volume: number;
  daily_volume: number;
  type: 'update/account_all_trades';
}

export interface WsAccountAllPositionsUpdate {
  channel: string;
  positions: Record<string, WsAccountPosition>;
  shares: WsPoolShare[];
  type: 'update/account_all_positions';
}

export interface SignerConfig {
  privateKey: string;
  accountIndex: number;
  apiKeyIndex: number;
}

export interface ApiKeyConfig {
  apiKey: string;
  secretKey: string;
  accountIndex: number;
  apiKeyIndex: number;
}

export interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: string[];
  parent_hash: string;
  state_root: string;
}

export interface Candlestick {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface Funding {
  timestamp: number;
  funding_rate: string;
  funding_index: string;
}

export interface RootInfo {
  version: string;
  chain_id: string;
  block_height: number;
}
