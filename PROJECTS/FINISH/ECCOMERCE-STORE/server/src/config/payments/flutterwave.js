import axios from "axios";

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

// Supported currencies for Flutterwave
export const flutterwaveCurrencies = [
  "NGN",
  "GHS",
  "KES",
  "UGX",
  "TZS",
  "ZAR",
  "USD",
  "EUR",
  "GBP",
];

// Initialize payment
export const initializeFlutterwavePayment = async (paymentData) => {
  try {
    // Map payment method to Flutterwave payment_options
    // Reference: https://developer.flutterwave.com/docs/collecting-payments/inline
    // Note: For Nigerian digital wallets (OPay, PalmPay, Kuda, etc.), use "account"
    const paymentOptionsMap = {
      card: "card",
      mobile_money: "mobilemoney",
      mobile_money_ghana: "mobilemoneyghana",
      mobile_money_rwanda: "mobilemoneyrwanda",
      mobile_money_uganda: "mobilemoneyuganda",
      mobile_money_zambia: "mobilemoneyzambia",
      mobile_money_franco: "mobilemoneyfranco", // Francophone countries
      ussd: "ussd",
      bank_transfer: "banktransfer",
      wallet: "account", // Nigerian digital wallets: OPay, PalmPay, Kuda, etc.
      barter: "barter", // Barter by Flutterwave specifically
      nqr: "nqr", // QR code payments
      mpesa: "mpesa", // M-Pesa specifically
      account: "account", // Bank account and digital wallet payments
      credit: "credit", // Credit/debit
      debit_ng_account: "debit_ng_account", // Nigerian bank account debit
      debit_uk_account: "debit_uk_account", // UK bank account debit
      ach_payment: "ach_payment", // ACH payments (US)
      apple_pay: "applepay",
      google_pay: "googlepay",
      payattitude: "payattitude", // PayAttitude
      paga: "paga", // Paga wallet
      "1voucher": "1voucher", // 1Voucher
      fawry_pay: "fawry_pay", // Fawry (Egypt)
    };

    // Build payment options string
    let paymentOptions = null;
    if (paymentData.paymentMethod && paymentOptionsMap[paymentData.paymentMethod]) {
      paymentOptions = paymentOptionsMap[paymentData.paymentMethod];
    }

    const requestBody = {
      tx_ref: paymentData.reference,
      amount: paymentData.amount,
      currency: paymentData.currency,
      redirect_url: paymentData.redirectUrl,
      customer: {
        email: paymentData.email,
        name: paymentData.name,
      },
      customizations: {
        title: paymentData.title || "Payment",
        description: paymentData.description || "Order payment",
      },
      meta: paymentData.metadata,
    };

    // Add payment_options if specified
    if (paymentOptions) {
      requestBody.payment_options = paymentOptions;
    }

    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY_TEST}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return {
        success: true,
        paymentLink: response.data.data.link,
        reference: paymentData.reference,
      };
    }

    return {
      success: false,
      error: response.data.message,
    };
  } catch (error) {
    console.error("Flutterwave initialization error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Verify payment
export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    console.log(`Verifying Flutterwave transaction: ${transactionId}`);
    
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY_TEST}`,
        },
      }
    );

    console.log('Flutterwave API response:', JSON.stringify(response.data, null, 2));

    if (response.data.status === "success") {
      const data = response.data.data;
      
      if (data.status === "successful") {
        return {
          success: true,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          reference: data.tx_ref,
          metadata: data.meta || {},
        };
      } else {
        return {
          success: false,
          error: `Payment status is ${data.status}`,
        };
      }
    }

    return {
      success: false,
      error: response.data.message || 'Verification failed',
    };
  } catch (error) {
    console.error("Flutterwave verification error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
