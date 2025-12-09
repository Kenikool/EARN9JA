import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  MapPin,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

// Types
interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ShippingMethod {
  _id: string;
  name: string;
  description: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  zones: Array<{
    baseRate: number;
    perKgRate: number;
  }>;
}

interface CheckoutData {
  step: number;
  shippingAddress: ShippingAddress;
  selectedShippingMethod: string;
  selectedPaymentMethod: string;
  selectedPaymentMethodDetail: string; // Store specific payment method within gateway
  selectedCurrency: string;
  couponCode: string;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
}

// Steps
const STEPS = [
  { id: 1, title: "Shipping Address", icon: MapPin },
  { id: 2, title: "Payment Method", icon: CreditCard },
  { id: 3, title: "Review Order", icon: CheckCircle },
];

// Payment gateways configuration with detailed payment methods
const PAYMENT_GATEWAYS = [
  {
    id: "wallet",
    name: "Wallet Balance",
    logo: "💰",
    description: "Pay instantly using your wallet balance",
    currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "GHS", "ZAR", "KES"],
    paymentMethods: [
      {
        id: "wallet",
        name: "Wallet Balance",
        description: "Instant payment from your wallet",
        icon: "💰",
        popular: true,
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: "💳",
    description: "Pay securely with multiple payment options",
    currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "GHS"],
    paymentMethods: [
      {
        id: "card",
        name: "Credit/Debit Card",
        description: "Visa, Mastercard, American Express",
        icon: "💳",
        popular: true,
      },
      {
        id: "apple_pay",
        name: "Apple Pay",
        description: "Pay with Touch ID or Face ID",
        icon: "📱",
        popular: true,
      },
      {
        id: "google_pay",
        name: "Google Pay",
        description: "Quick and secure mobile payments",
        icon: "📲",
        popular: true,
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        description: "Direct bank to bank transfer",
        icon: "🏦",
        popular: false,
      },
      {
        id: "klarna",
        name: "Klarna",
        description: "Buy now, pay later",
        icon: "💳",
        popular: false,
      },
    ],
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    logo: "🚀",
    description: "African-focused payment solutions",
    currencies: ["NGN", "GHS", "ZAR", "UGX", "RWF", "USD", "EUR"],
    paymentMethods: [
      {
        id: "card",
        name: "Bank Cards",
        description: "Visa, Mastercard, Verve",
        icon: "💳",
        popular: true,
      },
      {
        id: "mobile_money",
        name: "Mobile Money",
        description: "M-Pesa, Airtel Money, MTN Mobile Money",
        icon: "📱",
        popular: true,
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        description: "Direct bank transfers",
        icon: "🏦",
        popular: true,
      },
      {
        id: "ussd",
        name: "USSD Codes",
        description: "Dial codes for quick payments",
        icon: "📞",
        popular: false,
      },
      {
        id: "wallet",
        name: "Digital Wallets",
        description: "Barter, NQR, Paga, and more",
        icon: "👛",
        popular: false,
      },
      {
        id: "mpesa",
        name: "M-Pesa",
        description: "M-Pesa mobile money",
        icon: "📱",
        popular: false,
      },
      {
        id: "mobile_money_ghana",
        name: "Ghana Mobile Money",
        description: "MTN, Vodafone, AirtelTigo",
        icon: "🇬🇭",
        popular: false,
      },
      {
        id: "mobile_money_uganda",
        name: "Uganda Mobile Money",
        description: "MTN, Airtel Uganda",
        icon: "🇺🇬",
        popular: false,
      },
      {
        id: "mobile_money_rwanda",
        name: "Rwanda Mobile Money",
        description: "MTN Rwanda, Airtel Rwanda",
        icon: "🇷🇼",
        popular: false,
      },
      {
        id: "account",
        name: "Bank Account",
        description: "Pay directly from bank account",
        icon: "🏦",
        popular: false,
      },
      {
        id: "apple_pay",
        name: "Apple Pay",
        description: "Pay with Apple Pay",
        icon: "🍎",
        popular: false,
      },
      {
        id: "google_pay",
        name: "Google Pay",
        description: "Pay with Google Pay",
        icon: "📲",
        popular: false,
      },
    ],
  },
  {
    id: "paystack",
    name: "Paystack",
    logo: "💙",
    description: "Nigeria's leading payment platform",
    currencies: ["NGN", "GHS", "ZAR", "ZMW", "USD"],
    paymentMethods: [
      {
        id: "card",
        name: "Bank Cards",
        description: "Visa, Mastercard, Verve",
        icon: "💳",
        popular: true,
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        description: "Direct to bank account",
        icon: "🏦",
        popular: true,
      },
      {
        id: "ussd",
        name: "USSD",
        description: "Quick payment codes",
        icon: "📞",
        popular: false,
      },
      {
        id: "mobile_money",
        name: "Mobile Money",
        description: "MTN, AirtelTigo Money",
        icon: "📱",
        popular: false,
      },
      {
        id: "qr_code",
        name: "QR Code",
        description: "Scan to pay",
        icon: "📱",
        popular: false,
      },
    ],
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const items = cart?.items || [];

  const getTotalPrice = () => cart?.subtotal || 0;
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    step: 1,
    shippingAddress: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
    selectedShippingMethod: "",
    selectedPaymentMethod: "",
    selectedPaymentMethodDetail: "",
    selectedCurrency: "USD",
    couponCode: "",
  });

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await api.get("/wallet");
      return data.data.wallet;
    },
  });

  // Fetch shipping methods
  const { data: shippingMethods } = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: async () => {
      const response = await api.get("/shipping");
      return response.data.data.shippingMethods as ShippingMethod[];
    },
  });

  // Country to currency mapping
  const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    Nigeria: "NGN",
    NG: "NGN",
    Ghana: "GHS",
    GH: "GHS",
    Kenya: "KES",
    KE: "KES",
    "South Africa": "ZAR",
    ZA: "ZAR",
    "United States": "USD",
    US: "USD",
    "United Kingdom": "GBP",
    GB: "GBP",
    Canada: "CAD",
    CA: "CAD",
    Australia: "AUD",
    AU: "AUD",
    "European Union": "EUR",
    EU: "EUR",
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    const updates: Partial<CheckoutData> = {
      shippingAddress: {
        ...checkoutData.shippingAddress,
        [field]: value,
      },
    };

    // Auto-detect currency when country changes
    if (field === "country" && value) {
      const detectedCurrency = COUNTRY_CURRENCY_MAP[value] || "USD";
      updates.selectedCurrency = detectedCurrency;
      updates.selectedPaymentMethod = ""; // Reset payment method
      updates.selectedPaymentMethodDetail = "";
    }

    setCheckoutData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleNextStep = () => {
    if (checkoutData.step < 3) {
      setCheckoutData((prev) => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const handlePrevStep = () => {
    if (checkoutData.step > 1) {
      setCheckoutData((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const handlePaymentMethodChange = (
    gatewayId: string,
    paymentMethodId: string
  ) => {
    setCheckoutData((prev) => ({
      ...prev,
      selectedPaymentMethod: gatewayId,
      selectedPaymentMethodDetail: paymentMethodId,
    }));
  };

  const handleCurrencyChange = (currency: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      selectedCurrency: currency,
      selectedPaymentMethod: "", // Reset gateway when currency changes
      selectedPaymentMethodDetail: "", // Reset detailed method when currency changes
    }));
  };

  const handleApplyCoupon = async () => {
    if (!checkoutData.couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsCouponLoading(true);
    try {
      const response = await api.post("/coupons/validate", {
        code: checkoutData.couponCode.trim(),
        orderTotal: getTotalPrice(),
      });

      const { coupon, discount } = response.data.data;
      setAppliedCoupon({
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      });
      toast.success(`Coupon applied! You saved $${discount.toFixed(2)}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCheckoutData((prev) => ({ ...prev, couponCode: "" }));
    toast.success("Coupon removed");
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const discount = appliedCoupon?.discount || 0;
    return Math.max(0, subtotal - discount);
  };

  const handlePlaceOrder = async () => {
    try {
      // Final validation before placing order
      if (!isStepComplete(1) || !isStepComplete(2)) {
        alert("Please complete all required fields");
        return;
      }

      // Validate cart has items
      if (!items || items.length === 0) {
        alert("Your cart is empty");
        navigate("/cart");
        return;
      }

      // Validate currency is supported by selected gateway
      const selectedGateway = PAYMENT_GATEWAYS.find(
        (g) => g.id === checkoutData.selectedPaymentMethod
      );

      if (!selectedGateway) {
        alert("Invalid payment gateway selected");
        return;
      }

      if (!selectedGateway.currencies.includes(checkoutData.selectedCurrency)) {
        alert(
          `${selectedGateway.name} does not support ${checkoutData.selectedCurrency}. Please select a different currency or payment method.`
        );
        return;
      }

      // Validate payment method detail exists in selected gateway
      const paymentMethodExists = selectedGateway.paymentMethods.some(
        (pm) => pm.id === checkoutData.selectedPaymentMethodDetail
      );

      if (!paymentMethodExists) {
        alert("Invalid payment method selected");
        return;
      }

      // Special handling for wallet payment
      if (checkoutData.selectedPaymentMethod === "wallet") {
        const totalAmount = getFinalTotal();

        // Check wallet balance
        if (!walletData || walletData.balance < totalAmount) {
          toast.error(
            `Insufficient wallet balance. You have $${
              walletData?.balance.toFixed(2) || "0.00"
            } but need $${totalAmount.toFixed(2)}`
          );
          return;
        }

        // Create order with wallet payment
        const order = await createOrderMutation.mutateAsync({
          orderItems: items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: "wallet",
          paymentMethodDetail: "wallet",
          shippingMethodId: checkoutData.selectedShippingMethod,
          couponCode: appliedCoupon?.code || "",
          discount: appliedCoupon?.discount || 0,
        });

        // Process wallet payment
        try {
          await api.post(`/orders/${order._id}/pay-with-wallet`);
          clearCart();
          toast.success("Order placed successfully!");
          navigate(`/order-success?orderId=${order._id}`);
        } catch (error) {
          console.error("Wallet payment error:", error);
          toast.error("Failed to process wallet payment");
        }
        return;
      }

      // Create order
      const order = await createOrderMutation.mutateAsync({
        orderItems: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.selectedPaymentMethod,
        paymentMethodDetail: checkoutData.selectedPaymentMethodDetail,
        shippingMethodId: checkoutData.selectedShippingMethod,
        couponCode: appliedCoupon?.code || "",
        discount: appliedCoupon?.discount || 0,
      });

      // Initialize payment
      const paymentResponse = await initializePaymentMutation.mutateAsync({
        orderId: order._id,
        gateway: checkoutData.selectedPaymentMethod,
        currency: checkoutData.selectedCurrency,
        paymentMethod: checkoutData.selectedPaymentMethodDetail, // Send specific payment method
      });

      // Handle different payment gateway responses
      console.log("Payment Response:", paymentResponse);

      // Check if payment initialization was successful
      const isSuccess =
        paymentResponse.success === true ||
        paymentResponse.status === "success" ||
        (typeof paymentResponse.message === "string" &&
          paymentResponse.message.toLowerCase().includes("success"));

      if (isSuccess) {
        // Handle different gateway response structures
        if (checkoutData.selectedPaymentMethod === "stripe") {
          // For Stripe, redirect to success page (payment will be handled via webhooks)
          // Don't clear cart yet - will be cleared after payment verification
          navigate(`/order-success?orderId=${order._id}`);
        } else if (
          checkoutData.selectedPaymentMethod === "flutterwave" &&
          paymentResponse.data?.paymentLink
        ) {
          // Flutterwave: Redirect to payment page
          // Cart will be cleared after successful payment callback
          window.location.href = paymentResponse.data.paymentLink;
        } else if (
          checkoutData.selectedPaymentMethod === "paystack" &&
          paymentResponse.data?.authorizationUrl
        ) {
          // Paystack: Redirect to payment page
          // Cart will be cleared after successful payment callback
          window.location.href = paymentResponse.data.authorizationUrl;
        } else {
          // Fallback - redirect to success page
          // Don't clear cart yet - will be cleared after payment verification
          navigate(`/order-success?orderId=${order._id}`);
        }
      } else {
        // Payment initialization failed
        const errorMessage =
          paymentResponse.error ||
          paymentResponse.message ||
          "Unknown error occurred";
        alert(`Payment initialization failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: unknown) => {
      const response = await api.post("/orders", orderData);
      return response.data.data.order;
    },
  });

  // Initialize payment mutation
  const initializePaymentMutation = useMutation({
    mutationFn: async ({
      orderId,
      gateway,
      currency,
      paymentMethod,
    }: {
      orderId: string;
      gateway: string;
      currency: string;
      paymentMethod?: string;
    }) => {
      const response = await api.post("/payment/initialize", {
        orderId,
        gateway,
        currency,
        paymentMethod,
      });
      return response.data;
    },
  });

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: {
        // Validate all required shipping address fields
        const address = checkoutData.shippingAddress;
        return (
          address.fullName.trim().length >= 2 &&
          address.phone.trim().length >= 10 &&
          address.addressLine1.trim().length >= 5 &&
          address.city.trim().length >= 2 &&
          address.state.trim().length >= 2 &&
          address.zipCode.trim().length >= 3 &&
          address.country.length === 2 && // ISO country code
          checkoutData.selectedShippingMethod.length > 0
        );
      }
      case 2:
        // Validate payment method and currency selection
        return (
          checkoutData.selectedPaymentMethod.length > 0 &&
          checkoutData.selectedPaymentMethodDetail.length > 0 &&
          checkoutData.selectedCurrency.length === 3 && // ISO currency code
          // Verify currency is supported by selected gateway
          PAYMENT_GATEWAYS.find(
            (g) => g.id === checkoutData.selectedPaymentMethod
          )?.currencies.includes(checkoutData.selectedCurrency) === true
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (checkoutData.step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.fullName}
                  onChange={(e) =>
                    handleAddressChange("fullName", e.target.value)
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                />
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Address Line 1 *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.addressLine1}
                  onChange={(e) =>
                    handleAddressChange("addressLine1", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Address Line 2</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.addressLine2}
                  onChange={(e) =>
                    handleAddressChange("addressLine2", e.target.value)
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">City *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">State/Province *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Zip Code *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={checkoutData.shippingAddress.zipCode}
                  onChange={(e) =>
                    handleAddressChange("zipCode", e.target.value)
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Country *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={checkoutData.shippingAddress.country}
                  onChange={(e) =>
                    handleAddressChange("country", e.target.value)
                  }
                >
                  <option value="US">United States</option>
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                  <option value="KE">Kenya</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Method
              </h3>

              <div className="space-y-3">
                {shippingMethods?.map((method) => (
                  <label
                    key={method._id}
                    className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-base-200"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      className="radio radio-primary mt-1"
                      value={method._id}
                      checked={
                        checkoutData.selectedShippingMethod === method._id
                      }
                      onChange={(e) =>
                        setCheckoutData((prev) => ({
                          ...prev,
                          selectedShippingMethod: e.target.value,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-base-content/60">
                            {method.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${method.zones?.[0]?.baseRate?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm text-base-content/60">
                            {method.estimatedDays.min}-
                            {method.estimatedDays.max} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>

            <div className="space-y-6">
              {/* Wallet Balance Display */}
              {walletData && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <span>💰</span>
                        Wallet Balance
                      </h3>
                      <p className="text-sm text-base-content/80">
                        Available for instant checkout
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">
                        ${walletData.balance.toFixed(2)}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {walletData.currency}
                      </p>
                    </div>
                  </div>
                  {walletData.balance < getFinalTotal() && (
                    <div className="mt-3 text-sm text-warning">
                      ⚠️ Insufficient balance for this order. Please add funds
                      or choose another payment method.
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <h3 className="text-lg font-medium mb-2">💡 Payment Options</h3>
                <p className="text-sm text-base-content/80">
                  Choose your preferred payment method. Each option supports
                  different currencies and regions.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span>💳</span>
                  Select Your Payment Method
                </h3>

                <div className="grid gap-4">
                  {PAYMENT_GATEWAYS.map((gateway) => {
                    const isSupported = gateway.currencies.includes(
                      checkoutData.selectedCurrency
                    );
                    const isSelected =
                      checkoutData.selectedPaymentMethod === gateway.id;

                    return (
                      <div
                        key={gateway.id}
                        className={`
                          relative border-2 rounded-xl transition-all
                          ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-base-300 hover:border-primary/50"
                          }
                          ${!isSupported ? "opacity-50" : ""}
                        `}
                      >
                        <label className="flex items-start gap-4 p-6 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            className="radio radio-primary mt-1"
                            value={gateway.id}
                            checked={isSelected}
                            disabled={!isSupported}
                            onChange={() =>
                              handlePaymentMethodChange(gateway.id, "")
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="text-4xl">{gateway.logo}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold">
                                      {gateway.name}
                                    </h4>
                                    {isSelected && (
                                      <div className="badge badge-primary badge-sm">
                                        Selected
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-base-content/80 mb-3">
                                    {gateway.description}
                                  </p>

                                  {/* Supported currencies */}
                                  <div className="mt-3 pt-3 border-t border-base-300">
                                    <p className="text-xs text-base-content/60 mb-1">
                                      Supported currencies:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {gateway.currencies.map((currency) => (
                                        <span
                                          key={currency}
                                          className={`badge badge-xs ${
                                            checkoutData.selectedCurrency ===
                                            currency
                                              ? "badge-primary"
                                              : "badge-ghost"
                                          }`}
                                        >
                                          {currency}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>

                        {/* Payment Methods Display - Always show when supported */}
                        {isSupported && gateway.paymentMethods && (
                          <div className="border-t border-base-300 px-6 pb-6">
                            <p className="text-sm font-medium text-base-content/80 mb-3">
                              Select payment method:
                            </p>
                            <div className="grid gap-2">
                              {gateway.paymentMethods.map((method) => {
                                const isMethodSelected =
                                  isSelected &&
                                  checkoutData.selectedPaymentMethodDetail ===
                                    method.id;
                                return (
                                  <div
                                    key={method.id}
                                    className={`
                                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2
                                      ${
                                        isMethodSelected
                                          ? "border-primary bg-primary/10"
                                          : "border-transparent bg-base-200/50 hover:bg-base-200 hover:border-base-300"
                                      }
                                      ${
                                        method.popular
                                          ? "border-success/20 bg-success/5"
                                          : ""
                                      }
                                    `}
                                    onClick={() =>
                                      handlePaymentMethodChange(
                                        gateway.id,
                                        method.id
                                      )
                                    }
                                  >
                                    <input
                                      type="radio"
                                      name={`payment-method-${gateway.id}`}
                                      className="radio radio-primary"
                                      checked={isMethodSelected}
                                      onChange={() =>
                                        handlePaymentMethodChange(
                                          gateway.id,
                                          method.id
                                        )
                                      }
                                    />
                                    <span className="text-lg">
                                      {method.icon}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">
                                          {method.name}
                                        </p>
                                        {method.popular && (
                                          <span className="badge badge-success badge-xs">
                                            Popular
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-base-content/60">
                                        {method.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {!isSupported && (
                          <div className="absolute top-2 right-2">
                            <div className="badge badge-warning badge-sm">
                              Not supported for {checkoutData.selectedCurrency}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {PAYMENT_GATEWAYS.filter((gateway) =>
                  gateway.currencies.includes(checkoutData.selectedCurrency)
                ).length === 0 && (
                  <div className="alert alert-warning">
                    <div>
                      <span>
                        No payment methods available for{" "}
                        {checkoutData.selectedCurrency}. Please select a
                        different currency.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="divider"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span>🌍</span>
                  Currency Selection
                </h3>

                <div className="flex flex-wrap gap-2">
                  {["USD", "EUR", "GBP", "NGN", "GHS", "ZAR"].map(
                    (currency) => {
                      const supportedGateways = PAYMENT_GATEWAYS.filter(
                        (gateway) => gateway.currencies.includes(currency)
                      ).length;

                      return (
                        <button
                          key={currency}
                          onClick={() => handleCurrencyChange(currency)}
                          className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${
                            checkoutData.selectedCurrency === currency
                              ? "bg-primary text-primary-content border-primary"
                              : "bg-base-100 border-base-300 hover:border-primary"
                          }
                          ${supportedGateways === 0 ? "opacity-50" : ""}
                        `}
                        >
                          <span className="font-medium">{currency}</span>
                          {supportedGateways > 0 && (
                            <span className="text-xs ml-2">
                              ({supportedGateways} methods)
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <select
                  className="select select-bordered w-full max-w-xs"
                  value={checkoutData.selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                </select>
              </div>

              <div className="divider"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span>🎫</span>
                  Coupon Code
                </h3>

                {appliedCoupon ? (
                  <div className="alert alert-success">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            Coupon Applied: {appliedCoupon.code}
                          </p>
                          <p className="text-sm">
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}% off`
                              : `$${appliedCoupon.discountValue} off`}
                            {" - "}You saved $
                            {appliedCoupon.discount.toFixed(2)}
                          </p>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={handleRemoveCoupon}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 uppercase"
                        placeholder="Enter coupon code"
                        value={checkoutData.couponCode}
                        onChange={(e) =>
                          setCheckoutData((prev) => ({
                            ...prev,
                            couponCode: e.target.value.toUpperCase(),
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleApplyCoupon();
                          }
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handleApplyCoupon}
                        disabled={
                          isCouponLoading || !checkoutData.couponCode.trim()
                        }
                      >
                        {isCouponLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-base-content/60">
                      Have a discount code? Enter it here to save money on your
                      order.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Review Order
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="card bg-base-100 border">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Shipping Address</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">
                        {checkoutData.shippingAddress.fullName}
                      </p>
                      <p>{checkoutData.shippingAddress.addressLine1}</p>
                      {checkoutData.shippingAddress.addressLine2 && (
                        <p>{checkoutData.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {checkoutData.shippingAddress.city},{" "}
                        {checkoutData.shippingAddress.state}{" "}
                        {checkoutData.shippingAddress.zipCode}
                      </p>
                      <p>{checkoutData.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 border">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Payment Method</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {
                          PAYMENT_GATEWAYS.find(
                            (g) => g.id === checkoutData.selectedPaymentMethod
                          )?.logo
                        }
                      </span>
                      <div>
                        <p className="font-medium">
                          {
                            PAYMENT_GATEWAYS.find(
                              (g) => g.id === checkoutData.selectedPaymentMethod
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-base-content/60">
                          Currency: {checkoutData.selectedCurrency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border">
                <div className="card-body">
                  <h3 className="card-title text-lg">Order Summary</h3>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-base-content/60">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="divider"></div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Calculated at payment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>Calculated at payment</span>
                    </div>
                    <div className="divider"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-base-content/60 mb-6">
            Add some products to checkout.
          </p>
          <button onClick={() => navigate("/shop")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/cart")} className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = checkoutData.step === step.id;
              const isCompleted = checkoutData.step > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : isCompleted
                        ? "border-primary bg-primary text-white"
                        : "border-base-300 text-base-content/60"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isCompleted
                        ? "text-primary"
                        : "text-base-content/60"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 mx-4 ${
                        isCompleted ? "bg-primary" : "bg-base-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 border">
              <div className="card-body">{renderStepContent()}</div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevStep}
                disabled={checkoutData.step === 1}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {checkoutData.step < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!isStepComplete(checkoutData.step)}
                  className="btn btn-primary"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    !isStepComplete(checkoutData.step) ||
                    createOrderMutation.isPending ||
                    initializePaymentMutation.isPending
                  }
                  className="btn btn-success"
                >
                  {createOrderMutation.isPending ||
                  initializePaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 border sticky top-4">
              <div className="card-body">
                <h3 className="card-title">Order Summary</h3>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 h-12 bg-base-200 rounded-lg overflow-hidden">
                        <img
                          src={
                            item.product.images?.[0] ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-base-content/60">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-success">
                      <span className="flex items-center gap-1">
                        <span>🎫</span>
                        Discount ({appliedCoupon.code})
                      </span>
                      <span>-${appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-base-content/60">
                    <span>Shipping</span>
                    <span>Calculated at payment</span>
                  </div>
                  <div className="flex justify-between text-sm text-base-content/60">
                    <span>Tax</span>
                    <span>Calculated at payment</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-success text-center">
                      You saved ${appliedCoupon.discount.toFixed(2)}!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
