import axios from "axios";
import crypto from "crypto";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata: any;
  };
}

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: string;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PaystackRecipientResponse {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    details: {
      authorization_code: null;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

class PaystackService {
  private baseUrl: string = "https://api.paystack.co";

  private getSecretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY || "";
    if (!key) {
      throw new Error(
        "Paystack secret key not configured in environment variables"
      );
    }
    return key;
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata?: any
  ): Promise<PaystackInitializeResponse> {
    try {
      const response = await axios.post<PaystackInitializeResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: `${process.env.FRONTEND_URL}/wallet/payment-callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Paystack payment initialized: ${reference}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack initialize error:",
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
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
          },
        }
      );

      console.log(`✅ Paystack payment verified: ${reference}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack verify error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to verify payment"
      );
    }
  }

  /**
   * Create a transfer recipient
   */
  async createTransferRecipient(
    accountNumber: string,
    accountName: string,
    bankCode: string
  ): Promise<PaystackRecipientResponse> {
    try {
      const response = await axios.post<PaystackRecipientResponse>(
        `${this.baseUrl}/transferrecipient`,
        {
          type: "nuban",
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `✅ Paystack recipient created: ${response.data.data.recipient_code}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack create recipient error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to create transfer recipient"
      );
    }
  }

  /**
   * Initiate a transfer (withdrawal)
   */
  async initiateTransfer(
    amount: number,
    recipientCode: string,
    reason: string,
    reference: string
  ): Promise<PaystackTransferResponse> {
    try {
      const response = await axios.post<PaystackTransferResponse>(
        `${this.baseUrl}/transfer`,
        {
          source: "balance",
          amount: amount * 100, // Convert to kobo
          recipient: recipientCode,
          reason,
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Paystack transfer initiated: ${reference}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack transfer error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to initiate transfer"
      );
    }
  }

  /**
   * Verify Paystack webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET || "")
      .update(payload)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Resolve bank account number
   */
  async resolveAccountNumber(
    accountNumber: string,
    bankCode: string
  ): Promise<{
    account_number: string;
    account_name: string;
    bank_id: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
          },
        }
      );

      console.log(`✅ Account resolved: ${response.data.data.account_name}`);
      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack resolve account error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to resolve account number"
      );
    }
  }

  /**
   * Get list of Nigerian banks
   */
  async getBanks(): Promise<Array<{ name: string; code: string; id: number }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/bank?currency=NGN`, {
        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ Paystack get banks error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Failed to get banks");
    }
  }
}

export const paystackService = new PaystackService();
