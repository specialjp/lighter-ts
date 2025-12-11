# AccountApi

The `AccountApi` class provides methods for retrieving account information, API keys, PnL data, and public pools.

## Constructor

```typescript
new AccountApi(client: ApiClient)
```

## Methods

### getAccount(params: AccountParams)

Gets account information by index or L1 address.

**Parameters:**

- `by: 'index' | 'l1_address'` - Search by account index or L1 address
- `value: string` - The account index or L1 address value

**Returns:** `Promise<Account>` - Account information

**Example:**

```typescript
const accountApi = new AccountApi(client);

// Get account by index
const account = await accountApi.getAccount({ by: "index", value: "123" });

// Get account by L1 address
const account = await accountApi.getAccount({
  by: "l1_address",
  value: "0x1234567890123456789012345678901234567890",
});
```

### getAccountsByL1Address(l1Address: string)

Gets all accounts associated with an L1 address.

**Parameters:**

- `l1Address: string` - Ethereum address

**Returns:** `Promise<Account[]>` - Array of accounts

**Example:**

```typescript
const accounts = await accountApi.getAccountsByL1Address(
  "0x1234567890123456789012345678901234567890"
);
console.log(`Found ${accounts.length} accounts`);
```

### getApiKeys(accountIndex: number, apiKeyIndex: number)

Gets API keys for an account.

**Parameters:**

- `accountIndex: number` - Account index
- `apiKeyIndex: number` - API key index

**Returns:** `Promise<AccountApiKeys>` - API keys information

**Example:**

```typescript
const apiKeys = await accountApi.getApiKeys(123, 0);
console.log("API keys:", apiKeys.api_keys);
```

### getPnL(params: GetPnLParams)

Gets PnL (Profit and Loss) chart data for an account.

**Parameters:**

- `by: string` - Account identifier type (e.g., 'index', 'l1_address')
- `value: string` - Account identifier value
- `resolution: string` - Time resolution for PnL data (e.g., '1h', '1d', '1w')
- `startTimestamp: number` - Beginning timestamp for data range (milliseconds)
- `endTimestamp: number` - Ending timestamp for data range (milliseconds)
- `countBack: number` - Number of historical data points to retrieve
- `authorization?: string` - Optional authentication token (sent as Authorization header)
- `auth?: string` - Optional query-based authentication token
- `ignoreTransfers?: boolean` - Optional flag to exclude transfer transactions from PnL calculation

**Returns:** `Promise<AccountPnL>` - PnL chart data with entries

**Example:**

```typescript
const pnl = await accountApi.getPnL({
  by: 'index',
  value: '123',
  resolution: '1d',
  startTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
  endTimestamp: Date.now(),
  countBack: 7,
  ignoreTransfers: false,
});
console.log("PnL entries:", pnl.entries);
```

### getAccounts(params?: PaginationParams)

Gets a list of accounts with pagination.

**Parameters:**

- `limit?: number` - Maximum number of accounts to return
- `index?: number` - Starting index for pagination

**Returns:** `Promise<Account[]>` - Array of accounts

**Example:**

```typescript
const accounts = await accountApi.getAccounts({ limit: 50, index: 0 });
console.log(`Found ${accounts.length} accounts`);
```

### isWhitelisted(accountIndex: number)

Checks if an account is whitelisted.

**Parameters:**

- `accountIndex: number` - Account index

**Returns:** `Promise<{ is_whitelisted: boolean }>` - Whitelist status

**Example:**

```typescript
const { is_whitelisted } = await accountApi.isWhitelisted(123);
console.log("Is whitelisted:", is_whitelisted);
```

### getPublicPools(filter?: string, limit?: number, index?: number)

Gets public pool information.

**Parameters:**

- `filter?: string` - Filter type ('all', 'active', etc.)
- `limit?: number` - Maximum number of pools to return
- `index?: number` - Starting index for pagination

**Returns:** `Promise<PublicPool[]>` - Array of public pools

**Example:**

```typescript
const pools = await accountApi.getPublicPools("all", 10, 0);
console.log(`Found ${pools.length} public pools`);
```

### changeAccountTier(accountIndex: number, newTier: string, auth: string)

Changes the account tier (e.g., upgrade to premium tier).

**Parameters:**

- `accountIndex: number` - Account index
- `newTier: string` - New tier name (e.g., 'premium', 'standard')
- `auth: string` - Authentication token (use `SignerClient.createAuthToken()`)

**Returns:** `Promise<any>` - Change tier response

**Example:**

```typescript
// First, create an auth token
const signerClient = new SignerClient({
  /* config */
});
await signerClient.initialize();
const authToken = await signerClient.createAuthToken();

// Then change tier
const result = await accountApi.changeAccountTier(123, "premium", authToken);
console.log("Tier changed:", result);
```

## Types

### AccountParams

```typescript
interface AccountParams {
  by: "index" | "l1_address";
  value: string;
}
```

### Account

```typescript
interface Account {
  index: string;
  l1_address: string;
  l2_address: string;
  // ... other account properties
}
```

### AccountApiKeys

```typescript
interface AccountApiKeys {
  api_keys: ApiKey[];
}
```

### GetPnLParams

```typescript
interface GetPnLParams {
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
```

### AccountPnL

```typescript
interface AccountPnL {
  code: number;
  entries: PnLEntry[];
}
```

### PnLEntry

```typescript
interface PnLEntry {
  timestamp: number;
  pnl: string;
  cumulative_pnl: string;
}
```

### PublicPool

```typescript
interface PublicPool {
  pool_id: string;
  name: string;
  // ... other pool properties
}
```

## Error Handling

All methods throw errors for invalid parameters or network issues:

```typescript
try {
  const account = await accountApi.getAccount({ by: "index", value: "123" });
  console.log("Account:", account);
} catch (error) {
  console.error("Failed to get account:", error.message);
}
```

## Complete Example

```typescript
import { ApiClient, AccountApi } from "@specialjp/lighter-sdk";

async function main() {
  const client = new ApiClient({ host: "https://mainnet.zklighter.elliot.ai" });
  const accountApi = new AccountApi(client);

  try {
    // Get account by index
    const account = await accountApi.getAccount({ by: "index", value: "123" });
    console.log("Account:", account);

    // Get all accounts for an L1 address
    const accounts = await accountApi.getAccountsByL1Address(
      "0x1234567890123456789012345678901234567890"
    );
    console.log(`Found ${accounts.length} accounts`);

    // Get API keys
    const apiKeys = await accountApi.getApiKeys(123, 0);
    console.log("API keys:", apiKeys.api_keys);

    // Get PnL
    const pnl = await accountApi.getPnL({
      by: 'index',
      value: '123',
      resolution: '1d',
      startTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTimestamp: Date.now(),
      countBack: 7,
    });
    console.log("PnL:", pnl);

    // Get public pools
    const pools = await accountApi.getPublicPools("all", 10);
    console.log(`Found ${pools.length} public pools`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
```
