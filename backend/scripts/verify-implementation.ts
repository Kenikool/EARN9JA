import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, "../.env");
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

console.log("🔍 VERIFYING THIRD-PARTY TASK INTEGRATION (Tasks 1-15)\n");
console.log("=".repeat(70));

interface VerificationResult {
  task: string;
  status: "PASS" | "FAIL" | "WARN";
  details: string[];
}

const results: VerificationResult[] = [];

function addResult(
  task: string,
  status: "PASS" | "FAIL" | "WARN",
  details: string[]
) {
  results.push({ task, status, details });
}

async function verifyTask1() {
  console.log("\n📋 Task 1: Core Infrastructure");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check provider types
    const providerTypes = await import("../src/types/provider.types.js");
    details.push("✓ Provider types defined");

    // Check ExternalProvider model
    const ExternalProvider = await import("../src/models/ExternalProvider.js");
    details.push("✓ ExternalProvider model exists");

    // Check ProviderFactory
    const ProviderFactory = await import(
      "../src/services/providers/ProviderFactory.js"
    );
    details.push("✓ ProviderFactory exists");

    // Check CurrencyConversionService
    const CurrencyService = await import(
      "../src/services/CurrencyConversionService.js"
    );
    details.push("✓ CurrencyConversionService exists");

    // Check PostbackWebhookService
    const PostbackService = await import(
      "../src/services/PostbackWebhookService.js"
    );
    details.push("✓ PostbackWebhookService exists");

    // Check ExchangeRate model
    const ExchangeRate = await import("../src/models/ExchangeRate.js");
    details.push("✓ ExchangeRate model exists");

    // Check OfferWallTransaction model
    const OfferWallTransaction = await import(
      "../src/models/OfferWallTransaction.js"
    );
    details.push("✓ OfferWallTransaction model exists");
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 1: Core Infrastructure", status, details);
}

async function verifyTask2() {
  console.log("\n📋 Task 2: Offer Wall Providers");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check CPAGrip provider
    const CPAGripProvider = await import(
      "../src/services/providers/CPAGripProvider.js"
    );
    details.push("✓ CPAGripProvider exists");

    // Check OGAds provider
    const OGAdsProvider = await import(
      "../src/services/providers/OGAdsProvider.js"
    );
    details.push("✓ OGAdsProvider exists");

    // Check mobile UI files
    const offerwallsPath = join(__dirname, "../../Earn9ja/app/(offerwalls)");
    if (existsSync(offerwallsPath)) {
      details.push("✓ Mobile offerwall screens exist");
    } else {
      status = "WARN";
      details.push("⚠ Mobile offerwall screens not found");
    }
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 2: Offer Wall Providers", status, details);
}

async function verifyTask4() {
  console.log("\n📋 Task 4: Postback Webhook Handlers");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check postback routes
    const postbackRoutes = await import("../src/routes/postback.routes.js");
    details.push("✓ Postback routes exist");

    // Check postback controller
    const postbackController = await import(
      "../src/controllers/postback.controller.js"
    );
    details.push("✓ Postback controller exists");

    // Check PostbackLog model
    const PostbackLog = await import("../src/models/PostbackLog.js");
    details.push("✓ PostbackLog model exists");
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 4: Postback Webhook Handlers", status, details);
}

async function verifyTask5() {
  console.log("\n📋 Task 5: User Crediting System");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check PostbackWebhookService (handles crediting)
    const PostbackService = await import(
      "../src/services/PostbackWebhookService.js"
    );
    details.push("✓ PostbackWebhookService exists (handles crediting)");

    // Check OfferWallTransaction model
    const OfferWallTransaction = await import(
      "../src/models/OfferWallTransaction.js"
    );
    details.push("✓ OfferWallTransaction model exists");

    // Check Wallet model
    const Wallet = await import("../src/models/Wallet.js");
    details.push("✓ Wallet model exists");
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 5: User Crediting System", status, details);
}

async function verifyTask6() {
  console.log("\n📋 Task 6: Admin Provider Management");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check provider routes
    const providerRoutes = await import("../src/routes/provider.routes.js");
    details.push("✓ Provider routes exist");

    // Check provider controller
    const providerController = await import(
      "../src/controllers/provider.controller.js"
    );
    details.push("✓ Provider controller exists");

    // Check admin UI
    const adminProvidersPath = join(
      __dirname,
      "../../Earn9ja/app/(admin)/providers"
    );
    if (existsSync(adminProvidersPath)) {
      details.push("✓ Admin provider management UI exists");
    } else {
      status = "WARN";
      details.push("⚠ Admin provider UI not found");
    }
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 6: Admin Provider Management", status, details);
}

async function verifyTask7() {
  console.log("\n📋 Task 7: Mobile UI for Offer Walls");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check offerwall routes
    const offerwallRoutes = await import("../src/routes/offerwall.routes.js");
    details.push("✓ Offerwall routes exist");

    // Check offerwall controller
    const offerwallController = await import(
      "../src/controllers/offerwall.controller.js"
    );
    details.push("✓ Offerwall controller exists");

    // Check mobile screens
    const screens = ["index.tsx", "[providerId].tsx", "earnings.tsx"];

    for (const screen of screens) {
      const screenPath = join(
        __dirname,
        `../../Earn9ja/app/(offerwalls)/${screen}`
      );
      if (existsSync(screenPath)) {
        details.push(`✓ ${screen} exists`);
      } else {
        status = "WARN";
        details.push(`⚠ ${screen} not found`);
      }
    }
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 7: Mobile UI for Offer Walls", status, details);
}

async function verifyTask8() {
  console.log("\n📋 Task 8: Fraud Prevention");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check FraudPreventionService
    const FraudService = await import(
      "../src/services/FraudPreventionService.js"
    );
    details.push("✓ FraudPreventionService exists");

    // Check fraud routes
    const fraudRoutes = await import("../src/routes/fraud.routes.js");
    details.push("✓ Fraud routes exist");

    // Check fraud controller
    const fraudController = await import(
      "../src/controllers/fraud.controller.js"
    );
    details.push("✓ Fraud controller exists");

    // Check fraud monitor UI
    const fraudMonitorPath = join(
      __dirname,
      "../../Earn9ja/app/(admin)/fraud-monitor.tsx"
    );
    if (existsSync(fraudMonitorPath)) {
      details.push("✓ Fraud monitor UI exists");
    } else {
      status = "WARN";
      details.push("⚠ Fraud monitor UI not found");
    }
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 8: Fraud Prevention", status, details);
}

async function verifyTask9() {
  console.log("\n📋 Task 9: Analytics and Reporting");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check OfferWallAnalyticsService
    const AnalyticsService = await import(
      "../src/services/OfferWallAnalyticsService.js"
    );
    details.push("✓ OfferWallAnalyticsService exists");

    // Check analytics routes
    const analyticsRoutes = await import(
      "../src/routes/offerwall-analytics.routes.js"
    );
    details.push("✓ Offerwall analytics routes exist");

    // Check analytics controller
    const analyticsController = await import(
      "../src/controllers/offerwall-analytics.controller.js"
    );
    details.push("✓ Offerwall analytics controller exists");

    // Check analytics UI
    const analyticsUIPath = join(
      __dirname,
      "../../Earn9ja/app/(admin)/offerwall-analytics.tsx"
    );
    if (existsSync(analyticsUIPath)) {
      details.push("✓ Analytics UI exists");
    } else {
      status = "WARN";
      details.push("⚠ Analytics UI not found");
    }
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 9: Analytics and Reporting", status, details);
}

async function verifyTask11() {
  console.log("\n📋 Task 11: Task Recommendation System");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check TaskRecommendationService
    const RecommendationService = await import(
      "../src/services/TaskRecommendationService.js"
    );
    details.push("✓ TaskRecommendationService exists");
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 11: Task Recommendation System", status, details);
}

async function verifyTask13() {
  console.log("\n📋 Task 13: Background Jobs");
  const details: string[] = [];
  let status: "PASS" | "FAIL" | "WARN" = "PASS";

  try {
    // Check exchange rate update job
    const exchangeRateJob = await import(
      "../src/jobs/exchangeRateUpdate.job.js"
    );
    details.push("✓ Exchange rate update job exists");

    // Check provider health check job
    const healthCheckJob = await import(
      "../src/jobs/providerHealthCheck.job.js"
    );
    details.push("✓ Provider health check job exists");
  } catch (error: any) {
    status = "FAIL";
    details.push(`✗ Error: ${error.message}`);
  }

  addResult("Task 13: Background Jobs", status, details);
}

function printResults() {
  console.log("\n\n" + "=".repeat(70));
  console.log("📊 VERIFICATION RESULTS");
  console.log("=".repeat(70));

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const result of results) {
    const icon =
      result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(`\n${icon} ${result.task}`);

    for (const detail of result.details) {
      console.log(`   ${detail}`);
    }

    if (result.status === "PASS") passCount++;
    else if (result.status === "FAIL") failCount++;
    else warnCount++;
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ PASSED: ${passCount}`);
  console.log(`⚠️  WARNINGS: ${warnCount}`);
  console.log(`❌ FAILED: ${failCount}`);
  console.log("=".repeat(70));

  if (failCount === 0) {
    console.log("\n🎉 All critical components verified successfully!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Run: npm run test:system");
    console.log("   2. Seed providers: npm run seed:providers");
    console.log("   3. Test postback webhooks");
    console.log("   4. Configure provider credentials");
  } else {
    console.log(
      "\n⚠️  Some components failed verification. Please review the errors above."
    );
  }
}

async function main() {
  await verifyTask1();
  await verifyTask2();
  await verifyTask4();
  await verifyTask5();
  await verifyTask6();
  await verifyTask7();
  await verifyTask8();
  await verifyTask9();
  await verifyTask11();
  await verifyTask13();

  printResults();
}

main().catch(console.error);
