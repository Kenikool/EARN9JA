import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(2000),
    category: z.enum([
      "social_media",
      "music",
      "survey",
      "review",
      "game",
      "ads",
    ]),
    platform: z.string().min(1),
    taskType: z.string().min(1),
    targetUrl: z.string().url().optional().or(z.literal("")),
    reward: z.number().min(10),
    totalSlots: z.number().min(1).max(1000),
    requirements: z.array(z.string()).min(1),
    proofRequirements: z
      .array(
        z.object({
          type: z.enum(["screenshot", "link", "video", "text"]),
          description: z.string(),
          required: z.boolean().default(true),
        })
      )
      .min(1),
    estimatedTime: z.number().min(1).max(480), // Max 8 hours
    expiresAt: z.string().datetime(),
    targetAudience: z
      .object({
        minReputation: z.number().optional(),
        maxReputation: z.number().optional(),
        location: z.array(z.string()).optional(),
        ageRange: z
          .object({
            min: z.number(),
            max: z.number(),
          })
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        minimumPrice: z.number().min(10),
        suggestedPrice: z.number().min(10),
        actualPrice: z.number().min(10),
      })
      .optional(),
    metadata: z
      .object({
        platformName: z.string().optional(),
        taskTypeName: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        estimatedDuration: z.string().optional(),
        requirements: z.string().optional(),
      })
      .optional(),
  }),
});

export const browseTasksSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    platform: z.string().optional(),
    taskType: z.string().optional(),
    minReward: z.string().optional(),
    maxReward: z.string().optional(),
    minDuration: z.string().optional(),
    maxDuration: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["newest", "reward", "duration"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const submitTaskSchema = z.object({
  body: z.object({
    proofs: z
      .array(
        z.object({
          type: z.enum(["screenshot", "link", "video", "text"]),
          content: z.string(),
          description: z.string().optional(),
        })
      )
      .min(1),
  }),
});

export const reviewSubmissionSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject", "request_revision"]),
    reviewNotes: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).max(2000).optional(),
    status: z.enum(["active", "paused"]).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
