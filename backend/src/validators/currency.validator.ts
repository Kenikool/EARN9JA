import { body, param, query } from "express-validator";

const supportedCurrencies = ["USD", "EUR", "GBP", "NGN"];

export const currencyValidators = {
  convert: [
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number"),
    body("from")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `From currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
    body("to")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `To currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
  ],

  convertBatch: [
    body("conversions")
      .isArray({ min: 1, max: 100 })
      .withMessage("Conversions must be an array with 1-100 items"),
    body("conversions.*.amount")
      .isFloat({ min: 0.01 })
      .withMessage("Each amount must be a positive number"),
    body("conversions.*.from")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `From currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
    body("conversions.*.to")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `To currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
  ],

  getRate: [
    param("from")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `From currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
    param("to")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `To currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
  ],

  getRateHistory: [
    param("from")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `From currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
    param("to")
      .isString()
      .toUpperCase()
      .isIn(supportedCurrencies)
      .withMessage(
        `To currency must be one of: ${supportedCurrencies.join(", ")}`
      ),
    query("days")
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage("Days must be between 1 and 30"),
  ],
};
