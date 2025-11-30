import axios from "axios";
import crypto from "crypto";

interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

interface FlutterwaveTransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}

class FlutterwaveService {
  private secretKey: string;
  private baseUrl: string = "https://api.flutterwave.com/v3";

  constructor() {
    // Delay loading to ensure env is loaded
    this.secretKey = "";
  }

  private getSecretKey(): string {
    if (!this.secretKey) {
      this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY_TEST || "";
      if (!this.secretKey) {
        console.warn("⚠️  Flutterwave secret key not configured");
      } else {
        console.log(
          `✅ Flutterwave configured with key: ${this.secretKey.substring(
            0,
            10
          )}...`
        );
      }
    }
    return this.secretKey;
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    email: string,
    amount: number,
    txRef: string,
    customerName: string,
    metadata?: any
  ): Promise<FlutterwaveInitializeResponse> {
    try {
      const response = await axios.post<FlutterwaveInitializeResponse>(
        `${this.baseUrl}/payments`,
        {
          tx_ref: txRef,
          amount,
          currency: "NGN",
          redirect_url: `${process.env.FRONTEND_URL}/wallet/payment-callback`,
          payment_options: "card,banktransfer,ussd",
          customer: {
            email,
            name: customerName,
          },
          customizations: {
            title: "Earn9ja Wallet Top-up",
            description: "Add funds to your Earn9ja wallet",
            logo: "https://your-logo-url.com/logo.png",
          },
          meta: metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Flutterwave payment initialized: ${txRef}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Flutterwave initialize error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to initialize payment"
      );
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(
    transactionId: string
  ): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await axios.get<FlutterwaveVerifyResponse>(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
          },
        }
      );

      console.log(`✅ Flutterwave payment verified: ${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Flutterwave verify error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to verify payment"
      );
    }
  }

  /**
   * Initiate a bank transfer (withdrawal)
   */
  async initiateTransfer(
    accountNumber: string,
    accountBank: string,
    amount: number,
    narration: string,
    reference: string,
    beneficiaryName?: string
  ): Promise<FlutterwaveTransferResponse> {
    try {
      const response = await axios.post<FlutterwaveTransferResponse>(
        `${this.baseUrl}/transfers`,
        {
          account_bank: accountBank,
          account_number: accountNumber,
          amount,
          narration,
          currency: "NGN",
          reference,
          callback_url: `${process.env.BACKEND_URL}/api/v1/webhooks/flutterwave/transfer`,
          debit_currency: "NGN",
          beneficiary_name: beneficiaryName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Flutterwave transfer initiated: ${reference}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Flutterwave transfer error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to initiate transfer"
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha256", process.env.FLUTTERWAVE_SECRET_HASH || "")
      .update(payload)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Resolve bank account
   */
  async resolveAccount(
    accountNumber: string,
    accountBank: string
  ): Promise<{ account_number: string; account_name: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/accounts/resolve`,
        {
          account_number: accountNumber,
          account_bank: accountBank,
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Account resolved: ${response.data.data.account_name}`);
      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ Flutterwave resolve account error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to resolve account"
      );
    }
  }

  /**
   * Get list of Nigerian banks
   */
  async getBanks(): Promise<Array<{ id: number; code: string; name: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/banks/NG`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ Flutterwave get banks error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Failed to get banks");
    }
  }
}

export const flutterwaveService = new FlutterwaveService();
