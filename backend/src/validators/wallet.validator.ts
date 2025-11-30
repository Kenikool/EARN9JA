import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(1000, "Minimum withdrawal amount is ₦1,000"),
    method: z.enum(["bank_transfer", "opay", "palmpay"]),
    accountDetails: z.any().optional(),
  }),
});

export const topUpSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(500, "Minimum top-up amount is ₦500"),
    paymentMethod: z.enum(["paystack", "flutterwave", "bank_transfer", "card"]),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z
      .enum([
        "task_earning",
        "admob_reward",
        "referral_bonus",
        "daily_bonus",
        "withdrawal",
        "task_funding",
        "refund",
        "platform_fee",
      ])
      .optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    reference: z.string().min(1, "Reference is required"),
    paymentMethod: z.enum(["paystack", "flutterwave"]),
    transaction_id: z.string().optional(), // For Flutterwave
  }),
});
