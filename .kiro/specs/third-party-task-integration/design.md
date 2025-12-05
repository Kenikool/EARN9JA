# Design Document

## Overview

This design document details the architecture and implementation approach for integrating multiple third-party task providers across various categories (surveys, social media, games, videos, micro-tasks) into the Earn9ja platform. The solution provides workers with consistent earning opportunities while maximizing platform revenue through commission-based task aggregation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Mobile App (React Native)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Task Browser    │  │  Category Filter │                │
│  │  - All Tasks     │  │  - Survey        │                │
│  │  - Third-Party   │  │  - Social Media  │                │
│  │  - Sponsor       │  │  - Games         │                │
│  │  - Source Badge  │  │  - Videos        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Third-Party Task Aggregation Layer           │  │
│  │  - TaskAggregatorService                             │  │
│  │  - ProviderAdapterFactory                            │  │
│  │  - TaskNormalizationService                          │  │
│  │  - CommissionCalculatorService                       │  │
│  │  - CurrencyConversionService                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Provider Health & Monitoring                  │  │
│  │  - ProviderHealthService                             │  │
│  │  - PerformanceTrackerService                         │  │
│  │  - FraudDetectionService                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              External Provider APIs                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Surveys   │ │Social Media │ │   Games     │          │
│  │  - Toluna   │ │- Picoworkers│ │  - Mistplay │          │
│  │  - Opinion  │ │- Microworkers│ │  - AppStation│         │
│  │  - Survey   │ │- RapidWorkers│ │  - CashGiraffe│        │
│  │    Time     │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │   Videos    │ │ Micro-Tasks │                          │
│  │  - Hideout  │ │  - MTurk    │                          │
│  │  - Lootably │ │  - Clickworker│                        │
│  │  - AdGem    │ │  - Appen    │                          │
│  └─────────────┘ └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Provider Adapter Pattern

Each external provider has a dedicated adapter implementing a common interface.

```typescript
interface IProviderAdapter {
  providerId: string;
  providerName: string;
  category: TaskCategory;
  commissionRate: number;

  // Authentication
  authenticate(): Promise<boolean>;
  refreshToken(): Promise<void>;

  // Task Operations
  fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]>;
  getTaskDetails(externalTaskId: string): Promise<ExternalTask>;
  submitCompletion(taskId: string, proof: TaskProof): Promise<SubmissionResult>;

  // Status Checking
  checkTaskStatus(taskId: string): Promise<TaskStatus>;
  checkPayoutStatus(taskId: string): Promise<PayoutStatus>;
  getProviderHealth(): Promise<HealthStatus>;
}

enum TaskCategory {
  SURVEY = "survey",
  SOCIAL_MEDIA = "social_media",
  GAME = "game",
  VIDEO = "video",
  MICRO_TASK = "micro_task",
  APP_TESTING = "app_testing",
}

interface ExternalTask {
  externalId: string;
  providerId: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: {
    amount: number;
    currency: string; // USD, EUR, etc.
  };
  requirements: TaskRequirements;
  estimatedTime: number; // minutes
  proofType: "screenshot" | "link" | "text" | "automatic";
  expiresAt?: Date;
}

interface TaskRequirements {
  minAge?: number;
  countries?: string[]; // ['NG', 'GH', 'KE']
  demographics?: Record<string, any>;
  deviceType?: "mobile" | "desktop" | "both";
}
```

### 2. Survey Provider Adapters

#### TolunaAdapter

```typescript
class TolunaAdapter implements IProviderAdapter {
  providerId = "toluna";
  providerName = "Toluna";
  category = TaskCategory.SURVEY;
  commissionRate = 0.22; // 22%

  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.toluna.com/v1";

  async authenticate(): Promise<boolean> {
    const response = await axios.post(`${this.baseUrl}/auth`, {
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
    return response.data.success;
  }

  async fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]> {
    const response = await axios.get(`${this.baseUrl}/surveys`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: {
        country: "NG",
        min_reward: 50, // Minimum ₦50 after conversion
        status: "active",
      },
    });

    return response.data.surveys.map((survey) => this.normalizeTask(survey));
  }

  async submitCompletion(
    taskId: string,
    proof: TaskProof
  ): Promise<SubmissionResult> {
    const response = await axios.post(
      `${this.baseUrl}/surveys/${taskId}/complete`,
      {
        user_id: proof.userId,
        completion_code: proof.completionCode,
      }
    );

    return {
      success: response.data.success,
      reward: response.data.reward,
      message: response.data.message,
    };
  }

  private normalizeTask(survey: any): ExternalTask {
    return {
      externalId: survey.id,
      providerId: this.providerId,
      title: survey.title,
      description: survey.description,
      category: TaskCategory.SURVEY,
      reward: {
        amount: survey.reward_cents / 100,
        currency: "USD",
      },
      requirements: {
        minAge: survey.min_age,
        countries: survey.allowed_countries,
        demographics: survey.targeting,
      },
      estimatedTime: survey.estimated_minutes,
      proofType: "automatic",
      expiresAt: new Date(survey.expires_at),
    };
  }
}
```

#### OpinionWorldAdapter & SurveytimeAdapter

Similar implementations with provider-specific API endpoints and authentication.

### 3. Social Media Provider Adapters

#### PicoworkersAdapter

```typescript
class PicoworkersAdapter implements IProviderAdapter {
  providerId = "picoworkers";
  providerName = "Picoworkers";
  category = TaskCategory.SOCIAL_MEDIA;
  commissionRate = 0.18; // 18%

  private baseUrl = "https://api.picoworkers.com/v2";

  async fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]> {
    const response = await axios.get(`${this.baseUrl}/jobs`, {
      headers: { "X-API-Key": this.apiKey },
      params: {
        category: "social_media",
        min_pay: 0.5, // $0.50 minimum
        country: "NG",
      },
    });

    return response.data.jobs.map((job) => ({
      externalId: job.id,
      providerId: this.providerId,
      title: job.title,
      description: job.instructions,
      category: this.mapCategory(job.type),
      reward: {
        amount: job.pay_amount,
        currency: "USD",
      },
      requirements: {
        countries: job.allowed_countries,
      },
      estimatedTime: job.estimated_time,
      proofType: job.proof_required ? "screenshot" : "link",
    }));
  }

  private mapCategory(type: string): TaskCategory {
    const mapping = {
      instagram_follow: TaskCategory.SOCIAL_MEDIA,
      facebook_like: TaskCategory.SOCIAL_MEDIA,
      twitter_retweet: TaskCategory.SOCIAL_MEDIA,
      youtube_subscribe: TaskCategory.SOCIAL_MEDIA,
      tiktok_follow: TaskCategory.SOCIAL_MEDIA,
    };
    return mapping[type] || TaskCategory.SOCIAL_MEDIA;
  }
}
```

#### MicroworkersAdapter & RapidWorkersAdapter

Similar implementations for other social media task providers.

### 4. Game & App Testing Adapters

#### MistplayAdapter

```typescript
class MistplayAdapter implements IProviderAdapter {
  providerId = "mistplay";
  providerName = "Mistplay";
  category = TaskCategory.GAME;
  commissionRate = 0.12; // 12%

  private baseUrl = "https://api.mistplay.com/v1";

  async fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]> {
    const response = await axios.get(`${this.baseUrl}/games`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: {
        platform: "android",
        country: "NG",
      },
    });

    return response.data.games.map((game) => ({
      externalId: game.id,
      providerId: this.providerId,
      title: `Play ${game.name}`,
      description: `Install and play ${game.name} to earn rewards. Complete milestones for bonus earnings.`,
      category: TaskCategory.GAME,
      reward: {
        amount: game.base_reward,
        currency: "USD",
      },
      requirements: {
        deviceType: "mobile",
        countries: ["NG", "GH", "KE", "ZA"],
      },
      estimatedTime: game.min_play_time,
      proofType: "automatic", // Tracked via SDK
    }));
  }

  async trackProgress(userId: string, gameId: string): Promise<GameProgress> {
    const response = await axios.get(
      `${this.baseUrl}/progress/${userId}/${gameId}`
    );
    return {
      playTime: response.data.play_time_minutes,
      level: response.data.current_level,
      milestonesCompleted: response.data.milestones,
      earnedReward: response.data.earned_amount,
    };
  }
}
```

### 5. Video Watching Adapters

#### HideoutTVAdapter

```typescript
class HideoutTVAdapter implements IProviderAdapter {
  providerId = "hideout_tv";
  providerName = "Hideout.tv";
  category = TaskCategory.VIDEO;
  commissionRate = 0.25; // 25%

  private baseUrl = "https://api.hideout.tv/v1";

  async fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]> {
    const response = await axios.get(`${this.baseUrl}/videos`, {
      headers: { "X-Publisher-ID": this.publisherId },
      params: {
        country: "NG",
        min_duration: 30, // seconds
      },
    });

    return response.data.videos.map((video) => ({
      externalId: video.id,
      providerId: this.providerId,
      title: `Watch: ${video.title}`,
      description: video.description,
      category: TaskCategory.VIDEO,
      reward: {
        amount: video.payout_cents / 100,
        currency: "USD",
      },
      requirements: {},
      estimatedTime: Math.ceil(video.duration_seconds / 60),
      proofType: "automatic", // Verified via callback
    }));
  }

  async verifyCompletion(videoId: string, sessionId: string): Promise<boolean> {
    const response = await axios.post(`${this.baseUrl}/verify`, {
      video_id: videoId,
      session_id: sessionId,
    });
    return response.data.completed;
  }
}
```

### 6. Micro-Task Adapters

#### MTurkAdapter

```typescript
class MTurkAdapter implements IProviderAdapter {
  providerId = "mturk";
  providerName = "Amazon MTurk";
  category = TaskCategory.MICRO_TASK;
  commissionRate = 0.18; // 18%

  private baseUrl = "https://mturk-requester.us-east-1.amazonaws.com";

  async fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]> {
    const response = await this.mturkClient
      .listHITs({
        MaxResults: 100,
      })
      .promise();

    return response.HITs.map((hit) => ({
      externalId: hit.HITId,
      providerId: this.providerId,
      title: hit.Title,
      description: hit.Description,
      category: TaskCategory.MICRO_TASK,
      reward: {
        amount: parseFloat(hit.Reward),
        currency: "USD",
      },
      requirements: {
        countries: this.extractCountries(hit.QualificationRequirements),
      },
      estimatedTime: hit.AssignmentDurationInSeconds / 60,
      proofType: "text",
    }));
  }
}
```

### 7. Task Aggregation Service

```typescript
class TaskAggregatorService {
  private adapters: Map<string, IProviderAdapter> = new Map();
  private cache: NodeCache;

  constructor() {
    this.registerAdapters();
    this.cache = new NodeCache({ stdTTL: 900 }); // 15 minutes
  }

  private registerAdapters() {
    // Survey Providers
    this.adapters.set("toluna", new TolunaAdapter());
    this.adapters.set("opinionworld", new OpinionWorldAdapter());
    this.adapters.set("surveytime", new SurveytimeAdapter());

    // Social Media Providers
    this.adapters.set("picoworkers", new PicoworkersAdapter());
    this.adapters.set("microworkers", new MicroworkersAdapter());
    this.adapters.set("rapidworkers", new RapidWorkersAdapter());

    // Game Providers
    this.adapters.set("mistplay", new MistplayAdapter());
    this.adapters.set("appstation", new AppStationAdapter());
    this.adapters.set("cashgiraffe", new CashGiraffeAdapter());

    // Video Providers
    this.adapters.set("hideout_tv", new HideoutTVAdapter());
    this.adapters.set("lootably", new LootablyAdapter());
    this.adapters.set("adgem", new AdGemAdapter());

    // Micro-Task Providers
    this.adapters.set("mturk", new MTurkAdapter());
    this.adapters.set("clickworker", new ClickworkerAdapter());
    this.adapters.set("appen", new AppenAdapter());
  }

  async syncAllProviders(): Promise<void> {
    const syncPromises = Array.from(this.adapters.values()).map((adapter) =>
      this.syncProvider(adapter.providerId).catch((error) => {
        logger.error(`Failed to sync ${adapter.providerId}:`, error);
        return [];
      })
    );

    await Promise.all(syncPromises);
  }

  async syncProvider(providerId: string): Promise<ExternalTask[]> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) throw new Error(`Provider ${providerId} not found`);

    try {
      const externalTasks = await adapter.fetchTasks();
      const normalizedTasks = await Promise.all(
        externalTasks.map((task) => this.normalizeAndStore(task, adapter))
      );

      this.cache.set(`tasks_${providerId}`, normalizedTasks);
      return normalizedTasks;
    } catch (error) {
      await this.handleProviderError(providerId, error);
      throw error;
    }
  }

  private async normalizeAndStore(
    externalTask: ExternalTask,
    adapter: IProviderAdapter
  ): Promise<Task> {
    // Convert currency
    const ngnReward = await currencyService.convert(
      externalTask.reward.amount,
      externalTask.reward.currency,
      "NGN"
    );

    // Calculate commission
    const commission = ngnReward * adapter.commissionRate;
    const userReward = ngnReward - commission;

    // Create normalized task
    const task = await Task.create({
      title: externalTask.title,
      description: externalTask.description,
      category: externalTask.category,
      source: "third-party",
      providerId: adapter.providerId,
      providerName: adapter.providerName,
      externalTaskId: externalTask.externalId,
      reward: userReward,
      originalReward: ngnReward,
      commission: commission,
      commissionRate: adapter.commissionRate,
      estimatedTime: externalTask.estimatedTime,
      requirements: externalTask.requirements,
      proofType: externalTask.proofType,
      expiresAt: externalTask.expiresAt,
      status: "active",
    });

    return task;
  }

  async getAvailableTasks(filters: TaskFilters): Promise<Task[]> {
    const query: any = {
      source: "third-party",
      status: "active",
      expiresAt: { $gt: new Date() },
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minReward) {
      query.reward = { $gte: filters.minReward };
    }

    if (filters.maxTime) {
      query.estimatedTime = { $lte: filters.maxTime };
    }

    return Task.find(query)
      .sort({ reward: -1 })
      .limit(filters.limit || 50);
  }
}
```

### 8. Currency Conversion Service

```typescript
class CurrencyConversionService {
  private exchangeRates: Map<string, number> = new Map();
  private lastUpdate: Date;

  async updateExchangeRates(): Promise<void> {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    this.exchangeRates.set("USD_NGN", response.data.rates.NGN);
    this.exchangeRates.set(
      "EUR_NGN",
      response.data.rates.NGN / response.data.rates.EUR
    );
    this.exchangeRates.set(
      "GBP_NGN",
      response.data.rates.NGN / response.data.rates.GBP
    );

    this.lastUpdate = new Date();

    logger.info(
      "Exchange rates updated:",
      Object.fromEntries(this.exchangeRates)
    );
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    // Update rates if older than 6 hours
    if (
      !this.lastUpdate ||
      Date.now() - this.lastUpdate.getTime() > 6 * 60 * 60 * 1000
    ) {
      await this.updateExchangeRates();
    }

    const rateKey = `${from}_${to}`;
    const rate = this.exchangeRates.get(rateKey);

    if (!rate) {
      throw new Error(`Exchange rate not found for ${rateKey}`);
    }

    return Math.round(amount * rate * 100) / 100; // Round to 2 decimals
  }

  getRate(from: string, to: string): number {
    return this.exchangeRates.get(`${from}_${to}`) || 0;
  }
}
```

### 9. Provider Health Monitoring

```typescript
class ProviderHealthService {
  async checkProviderHealth(providerId: string): Promise<HealthStatus> {
    const adapter = taskAggregator.getAdapter(providerId);

    const metrics = await ProviderMetrics.findOne({ providerId }).sort({
      createdAt: -1,
    });

    const health: HealthStatus = {
      providerId,
      status: "healthy",
      uptime: metrics?.uptime || 100,
      avgResponseTime: metrics?.avgResponseTime || 0,
      errorRate: metrics?.errorRate || 0,
      lastSync: metrics?.lastSync,
      issues: [],
    };

    // Check response time
    if (health.avgResponseTime > 5000) {
      health.status = "degraded";
      health.issues.push("High response time");
    }

    // Check error rate
    if (health.errorRate > 0.1) {
      health.status = "unhealthy";
      health.issues.push("High error rate");
    }

    // Check last sync
    if (
      health.lastSync &&
      Date.now() - health.lastSync.getTime() > 30 * 60 * 1000
    ) {
      health.status = "stale";
      health.issues.push("No recent sync");
    }

    return health;
  }

  async disableProvider(providerId: string, reason: string): Promise<void> {
    await ExternalProvider.updateOne(
      { providerId },
      {
        status: "disabled",
        disabledReason: reason,
        disabledAt: new Date(),
      }
    );

    logger.warn(`Provider ${providerId} disabled: ${reason}`);

    // Notify admins
    await notificationService.notifyAdmins({
      type: "provider_disabled",
      providerId,
      reason,
    });
  }
}
```

## Data Models

### ExternalProvider Model

```typescript
interface ExternalProviderDocument {
  providerId: string;
  name: string;
  category: TaskCategory;
  apiEndpoint: string;
  apiKey: string;
  apiSecret?: string;
  status: "active" | "inactive" | "disabled";
  commissionRate: number;
  supportedCurrencies: string[];
  config: {
    syncInterval: number;
    maxTasksPerSync: number;
    timeout: number;
  };
  metrics: {
    totalTasksSynced: number;
    totalCompletions: number;
    totalRevenue: number;
    avgCompletionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Model Extension

```typescript
interface TaskDocument {
  // ... existing fields
  source: "sponsor" | "third-party";
  providerId?: string;
  providerName?: string;
  externalTaskId?: string;
  originalReward?: number;
  commission?: number;
  commissionRate?: number;
  proofType: "screenshot" | "link" | "text" | "automatic";
}
```

## Error Handling

```typescript
class ProviderError extends Error {
  constructor(
    public providerId: string,
    public errorCode: string,
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
  }
}

// Retry logic with exponential backoff
async function retryProviderCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !(error as ProviderError).retryable) {
        throw error;
      }
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
  throw new Error("Max retries exceeded");
}
```

## Background Jobs

```typescript
// Sync all providers every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  await taskAggregator.syncAllProviders();
});

// Update exchange rates every 6 hours
cron.schedule("0 */6 * * *", async () => {
  await currencyService.updateExchangeRates();
});

// Check provider health hourly
cron.schedule("0 * * * *", async () => {
  const providers = await ExternalProvider.find({ status: "active" });
  for (const provider of providers) {
    const health = await providerHealthService.checkProviderHealth(
      provider.providerId
    );
    if (health.status === "unhealthy") {
      await providerHealthService.disableProvider(
        provider.providerId,
        health.issues.join(", ")
      );
    }
  }
});

// Clean up expired tasks daily
cron.schedule("0 2 * * *", async () => {
  await Task.updateMany(
    {
      source: "third-party",
      expiresAt: { $lt: new Date() },
      status: "active",
    },
    { status: "expired" }
  );
});
```

## Testing Strategy

- Unit tests for each provider adapter
- Integration tests with provider sandbox APIs
- Mock external API responses for reliable testing
- Performance tests for task aggregation
- End-to-end tests for complete task flow

## Deployment Strategy

**Phase 1: Survey Providers (Week 1-2)**

- Integrate Toluna, OpinionWorld, Surveytime
- Test with 100 beta users
- Monitor commission revenue

**Phase 2: Social Media & Videos (Week 3-4)**

- Add Picoworkers, Hideout.tv
- Expand to 500 users
- Optimize sync performance

**Phase 3: Games & Micro-Tasks (Week 5-6)**

- Add Mistplay, MTurk
- Full rollout to all users
- Analytics dashboard

This design provides a scalable, profitable third-party task integration system that generates real revenue through commission-based task aggregation.
