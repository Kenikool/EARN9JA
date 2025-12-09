import Stripe from "stripe";

// Initialize Stripe (only if key is provided)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export default stripe;

// Supported currencies for Stripe
export const stripeCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
];

// Create payment intent
export const createStripePaymentIntent = async (amount, currency, metadata, paymentMethod) => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.",
      };
    }

    // Map payment methods to Stripe payment method types
    const paymentMethodTypesMap = {
      card: ['card'],
      apple_pay: ['card'], // Apple Pay uses card payment method
      google_pay: ['card'], // Google Pay uses card payment method
      bank_transfer: ['us_bank_account', 'sepa_debit'],
      klarna: ['klarna'],
    };

    // Get payment method types or use automatic
    const paymentMethodTypes = paymentMethod && paymentMethodTypesMap[paymentMethod]
      ? paymentMethodTypesMap[paymentMethod]
      : undefined;

    const paymentIntentConfig = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
    };

    // If specific payment method types are provided, use them
    if (paymentMethodTypes) {
      paymentIntentConfig.payment_method_types = paymentMethodTypes;
    } else {
      // Otherwise, enable automatic payment methods
      paymentIntentConfig.automatic_payment_methods = {
        enabled: true,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify payment
export const verifyStripePayment = async (paymentIntentId) => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.",
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    };
  } catch (error) {
    console.error("Stripe verification error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
