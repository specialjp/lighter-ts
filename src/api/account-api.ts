import { ApiClient } from './api-client';

export interface AccountPosition {
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
  margin_mode: number;
  allocated_margin: string;
}

export interface Account {
  code: number;
  account_type: number;
  index: number;
  l1_address: string;
  cancel_all_time: number;
  total_order_count: number;
  total_isolated_order_count: number;
  pending_order_count: number;
  available_balance: string;
  status: number;
  collateral: string;
  account_index: number;
  name: string;
  description: string;
  can_invite: boolean;
  referral_points_percentage: string;
  positions: AccountPosition[];
  total_asset_value: string;
  cross_asset_value: string;
  shares: any[];
}

export type AccountResponse = GetAccountResponse;

export interface GetAccountResponse {
  code: number;
  total: number;
  accounts: Account[];
}

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
}

export interface Trade {
  id: string;
  market_id: number;
  side: 'buy' | 'sell';
  size: string;
  price: string;
  fee: string;
  timestamp: string;
}

export interface AccountApiKeys {
  api_keys: ApiKey[];
}

export interface ApiKey {
  index: number;
  name: string;
  permissions: string[];
  created_at: string;
  last_used_at?: string;
}

export interface PublicPool {
  id: string;
  name: string;
  description: string;
  total_value_locked: string;
  apy: string;
  shares: PublicPoolShare[];
}

export interface PublicPoolShare {
  token: string;
  amount: string;
  value: string;
}

export interface GetPnLParams {
  by: string;
  value: string;
  resolution: string;
  startTimestamp: number;
  endTimestamp: number;
  countBack: number;
  authorization?: string;
  auth?: string;
  ignoreTransfers?: boolean;
}

export interface PnLEntry {
  timestamp: number;
  pnl: string;
  cumulative_pnl: string;
}

export interface AccountPnL {
  code: number;
  entries: PnLEntry[];
}

export class AccountApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  public async getAccount(params: {
    by: string;
    value: string;
  }): Promise<GetAccountResponse> {
    const response = await this.client.get<GetAccountResponse>(
      '/api/v1/account',
      {
        by: params.by,
        value: params.value,
      }
    );
    return response.data;
  }

  public async getAccountsByL1Address(
    l1Address: string
  ): Promise<GetAccountResponse> {
    const response = await this.client.get<GetAccountResponse>(
      '/api/v1/accountsByL1Address',
      {
        l1_address: l1Address,
      }
    );
    return response.data;
  }

  public async getApiKeys(
    accountIndex: number,
    apiKeyIndex: number
  ): Promise<AccountApiKeys> {
    const response = await this.client.get<AccountApiKeys>('/api/v1/apikeys', {
      account_index: accountIndex,
      api_key_index: apiKeyIndex,
    });
    return response.data;
  }

  public async getPnL(params: GetPnLParams): Promise<AccountPnL> {
    const queryParams = {
      by: params.by,
      value: params.value,
      resolution: params.resolution,
      start_timestamp: params.startTimestamp,
      end_timestamp: params.endTimestamp,
      count_back: params.countBack,
      ...(params.auth && { auth: params.auth }),
      ...(params.ignoreTransfers !== undefined && { ignore_transfers: params.ignoreTransfers }),
    };

    const config = params.authorization
      ? { headers: { Authorization: params.authorization } }
      : undefined;

    const response = await this.client.get<AccountPnL>(
      '/api/v1/pnl',
      queryParams,
      config
    );
    return response.data;
  }

  public async getPublicPools(
    filter: string = 'all',
    limit: number = 10,
    index: number = 0
  ): Promise<PublicPool[]> {
    const response = await this.client.get<PublicPool[]>(
      '/api/v1/publicPools',
      {
        filter,
        limit,
        index,
      }
    );
    return response.data;
  }
}
