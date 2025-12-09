import axios from "axios";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Supported currencies for Paystack
export const paystackCurrencies = ["NGN", "GHS", "ZAR", "USD"];

// Initialize payment
export const initializePaystackPayment = async (paymentData) => {
  try {
    // Map payment methods to Paystack channels
    // Reference: https://paystack.com/docs/api/#transaction-initialize
    const channelsMap = {
      card: ['card'],
      bank_transfer: ['bank_transfer'],
      ussd: ['ussd'],
      mobile_money: ['mobile_money'],
      qr_code: ['qr'],
    };

    // Build request body
    const requestBody = {
      email: paymentData.email,
      amount: Math.round(paymentData.amount * 100), // Convert to kobo/pesewas
      currency: paymentData.currency,
      reference: paymentData.reference,
      callback_url: paymentData.callbackUrl,
      metadata: paymentData.metadata,
    };

    // Add specific channels if payment method is specified
    if (paymentData.paymentMethod && channelsMap[paymentData.paymentMethod]) {
      requestBody.channels = channelsMap[paymentData.paymentMethod];
    }

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    }

    return {
      success: false,
      error: response.data.message,
    };
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Verify payment
export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status) {
      const data = response.data.data;
      return {
        success: data.status === "success",
        status: data.status,
        amount: data.amount / 100, // Convert from kobo/pesewas
        currency: data.currency,
        reference: data.reference,
      };
    }

    return {
      success: false,
      error: response.data.message,
    };
  } catch (error) {
    console.error("Paystack verification error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
