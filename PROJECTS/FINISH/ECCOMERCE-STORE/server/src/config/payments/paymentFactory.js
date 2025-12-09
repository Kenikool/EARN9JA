import {
  stripeCurrencies,
  createStripePaymentIntent,
  verifyStripePayment,
} from "./stripe.js";
import {
  flutterwaveCurrencies,
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
} from "./flutterwave.js";
import {
  paystackCurrencies,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "./paystack.js";

// Get available payment gateways for a currency
export const getAvailableGateways = (currency) => {
  const gateways = [];

  if (stripeCurrencies.includes(currency)) {
    gateways.push("stripe");
  }

  if (flutterwaveCurrencies.includes(currency)) {
    gateways.push("flutterwave");
  }

  if (paystackCurrencies.includes(currency)) {
    gateways.push("paystack");
  }

  return gateways;
};

// Get all supported currencies
export const getAllSupportedCurrencies = () => {
  const allCurrencies = new Set([
    ...stripeCurrencies,
    ...flutterwaveCurrencies,
    ...paystackCurrencies,
  ]);

  return Array.from(allCurrencies).map((code) => ({
    code,
    gateways: getAvailableGateways(code),
  }));
};

// Initialize payment based on gateway
export const initializePayment = async (gateway, paymentData) => {
  switch (gateway.toLowerCase()) {
    case "stripe":
      return await createStripePaymentIntent(
        paymentData.amount,
        paymentData.currency,
        paymentData.metadata,
        paymentData.paymentMethod // Pass payment method to Stripe
      );

    case "flutterwave":
      return await initializeFlutterwavePayment(paymentData);

    case "paystack":
      return await initializePaystackPayment(paymentData);

    default:
      return {
        success: false,
        error: "Unsupported payment gateway",
      };
  }
};

// Verify payment based on gateway
export const verifyPayment = async (gateway, reference) => {
  switch (gateway.toLowerCase()) {
    case "stripe":
      return await verifyStripePayment(reference);

    case "flutterwave":
      return await verifyFlutterwavePayment(reference);

    case "paystack":
      return await verifyPaystackPayment(reference);

    default:
      return {
        success: false,
        error: "Unsupported payment gateway",
      };
  }
};
