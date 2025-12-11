import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { OrderApi, Order, OrderBookOrders, Trade } from "../src/api/order-api";
import { ApiClient } from "../src/api/api-client";

describe("OrderApi dormant methods", () => {
  let mockClient: { post: jest.Mock; get: jest.Mock; delete: jest.Mock };
  let orderApi: OrderApi;

  beforeEach(() => {
    mockClient = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    orderApi = new OrderApi(mockClient as unknown as ApiClient);
  });

  describe("getOrderBookOrders", () => {
    it("should request order book orders with market and depth", async () => {
      const expected: OrderBookOrders = {
        code: 200,
        total_asks: 1,
        asks: [],
        total_bids: 1,
        bids: [],
      };

      mockClient.get.mockImplementation(async () => ({ data: expected }));

      const result = await orderApi.getOrderBookOrders({
        market_id: 1,
        limit: 1,
      });

      expect(mockClient.get).toHaveBeenCalledWith("/api/v1/orderBookOrders", {
        market_id: 2,
        depth: 5,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("getTrades", () => {
    it("should request trades with pagination support", async () => {
      const trades: Trade[] = [
        {
          id: "t1",
          market_id: 3,
          side: "sell",
          size: "0.1",
          price: "3000",
          fee: "0.01",
          timestamp: "123456",
          order_id: "o1",
          taker_order_id: "taker1",
          maker_order_id: "maker1",
        },
      ];

      mockClient.get.mockImplementation(async () => ({ data: trades }));

      const result = await orderApi.getTrades({
        market_id: 3,
        limit: 50,
        index: 10,
        sort: "desc",
      });

      expect(mockClient.get).toHaveBeenCalledWith("/api/v1/trades", {
        market_id: 3,
        limit: 50,
        index: 10,
        sort: "desc",
      });
      expect(result).toEqual(trades);
    });
  });
});
