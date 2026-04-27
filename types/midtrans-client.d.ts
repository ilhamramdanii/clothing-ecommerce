declare module "midtrans-client" {
  interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  interface SnapParameter {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    [key: string]: unknown;
  }

  interface SnapTransaction {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: SnapParameter): Promise<SnapTransaction>;
    createTransactionToken(parameter: SnapParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapParameter): Promise<string>;
  }

  class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>;
      cancel(orderId: string): Promise<Record<string, unknown>>;
    };
  }

  export = { Snap, CoreApi };
}
