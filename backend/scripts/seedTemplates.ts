import mongoose from "mongoose";
import { TaskTemplate } from "../src/models/TaskTemplate";
import dotenv from "dotenv";

dotenv.config();

const templates = [
  // SOCIAL_MEDIA Templates
  {
    name: "Instagram Follow",
    description: "Follow an Instagram account",
    category: "SOCIAL_MEDIA",
    platform: "Instagram",
    taskType: "Follow",
    templateData: {
      title: "Follow {username} on Instagram",
      description:
        "Follow the Instagram account @{username} and provide a screenshot as proof.",
      requirements: [
        "Must have an active Instagram account",
        "Follow the account @{username}",
        "Take a screenshot showing you followed the account",
        "Do not unfollow within 7 days",
      ],
      estimatedTime: 2,
      targetUrl: "https://instagram.com/{username}",
      variables: ["username"],
    },
    isOfficial: true,
  },
  {
    name: "Instagram Like Post",
    description: "Like a specific Instagram post",
    category: "SOCIAL_MEDIA",
    platform: "Instagram",
    taskType: "Like",
    templateData: {
      title: "Like Instagram Post",
      description:
        "Like the Instagram post at the provided URL and submit proof.",
      requirements: [
        "Must have an active Instagram account",
        "Like the specified post",
        "Take a screenshot showing the liked post",
      ],
      estimatedTime: 1,
      targetUrl: "{post_url}",
      variables: ["post_url"],
    },
    isOfficial: true,
  },
  {
    name: "Instagram Comment",
    description: "Comment on an Instagram post",
    category: "SOCIAL_MEDIA",
    platform: "Instagram",
    taskType: "Comment",
    templateData: {
      title: "Comment on Instagram Post",
      description:
        "Leave a meaningful comment on the Instagram post at the provided URL.",
      requirements: [
        "Must have an active Instagram account",
        "Comment must be at least 10 words",
        "Comment must be relevant to the post",
        "Take a screenshot of your comment",
      ],
      estimatedTime: 3,
      targetUrl: "{post_url}",
      variables: ["post_url"],
    },
    isOfficial: true,
  },
  {
    name: "Facebook Page Like",
    description: "Like a Facebook page",
    category: "SOCIAL_MEDIA",
    platform: "Facebook",
    taskType: "Like",
    templateData: {
      title: "Like {page_name} on Facebook",
      description: "Like the Facebook page and provide proof of completion.",
      requirements: [
        "Must have an active Facebook account",
        "Like the specified Facebook page",
        "Take a screenshot showing you liked the page",
      ],
      estimatedTime: 2,
      targetUrl: "https://facebook.com/{page_name}",
      variables: ["page_name"],
    },
    isOfficial: true,
  },
  {
    name: "Twitter Follow",
    description: "Follow a Twitter/X account",
    category: "SOCIAL_MEDIA",
    platform: "Twitter",
    taskType: "Follow",
    templateData: {
      title: "Follow @{username} on Twitter/X",
      description: "Follow the Twitter/X account and submit proof.",
      requirements: [
        "Must have an active Twitter/X account",
        "Follow @{username}",
        "Take a screenshot showing you followed",
        "Do not unfollow within 7 days",
      ],
      estimatedTime: 2,
      targetUrl: "https://twitter.com/{username}",
      variables: ["username"],
    },
    isOfficial: true,
  },
  {
    name: "Twitter Retweet",
    description: "Retweet a specific tweet",
    category: "SOCIAL_MEDIA",
    platform: "Twitter",
    taskType: "Share",
    templateData: {
      title: "Retweet This Tweet",
      description: "Retweet the specified tweet and provide proof.",
      requirements: [
        "Must have an active Twitter/X account",
        "Retweet the specified tweet",
        "Take a screenshot of the retweet",
      ],
      estimatedTime: 1,
      targetUrl: "{tweet_url}",
      variables: ["tweet_url"],
    },
    isOfficial: true,
  },
  {
    name: "TikTok Follow",
    description: "Follow a TikTok account",
    category: "SOCIAL_MEDIA",
    platform: "TikTok",
    taskType: "Follow",
    templateData: {
      title: "Follow @{username} on TikTok",
      description: "Follow the TikTok account and submit proof of completion.",
      requirements: [
        "Must have an active TikTok account",
        "Follow @{username}",
        "Take a screenshot showing you followed",
        "Do not unfollow within 7 days",
      ],
      estimatedTime: 2,
      targetUrl: "https://tiktok.com/@{username}",
      variables: ["username"],
    },
    isOfficial: true,
  },
  {
    name: "TikTok Like Video",
    description: "Like a TikTok video",
    category: "SOCIAL_MEDIA",
    platform: "TikTok",
    taskType: "Like",
    templateData: {
      title: "Like TikTok Video",
      description: "Like the specified TikTok video and provide proof.",
      requirements: [
        "Must have an active TikTok account",
        "Like the specified video",
        "Take a screenshot showing the liked video",
      ],
      estimatedTime: 1,
      targetUrl: "{video_url}",
      variables: ["video_url"],
    },
    isOfficial: true,
  },
  {
    name: "YouTube Subscribe",
    description: "Subscribe to a YouTube channel",
    category: "SOCIAL_MEDIA",
    platform: "YouTube",
    taskType: "Subscribe",
    templateData: {
      title: "Subscribe to {channel_name} on YouTube",
      description: "Subscribe to the YouTube channel and provide proof.",
      requirements: [
        "Must have an active YouTube account",
        "Subscribe to the channel",
        "Turn on notifications (optional)",
        "Take a screenshot showing subscription",
        "Do not unsubscribe within 7 days",
      ],
      estimatedTime: 2,
      targetUrl: "{channel_url}",
      variables: ["channel_name", "channel_url"],
    },
    isOfficial: true,
  },
  {
    name: "YouTube Like Video",
    description: "Like a YouTube video",
    category: "SOCIAL_MEDIA",
    platform: "YouTube",
    taskType: "Like",
    templateData: {
      title: "Like YouTube Video",
      description: "Like the specified YouTube video and submit proof.",
      requirements: [
        "Must have an active YouTube account",
        "Like the specified video",
        "Take a screenshot showing the liked video",
      ],
      estimatedTime: 1,
      targetUrl: "{video_url}",
      variables: ["video_url"],
    },
    isOfficial: true,
  },

  // MUSIC Templates
  {
    name: "Spotify Follow Artist",
    description: "Follow an artist on Spotify",
    category: "MUSIC",
    platform: "Spotify",
    taskType: "Follow",
    templateData: {
      title: "Follow {artist_name} on Spotify",
      description: "Follow the artist on Spotify and provide proof.",
      requirements: [
        "Must have an active Spotify account",
        "Follow the specified artist",
        "Take a screenshot showing you followed",
      ],
      estimatedTime: 2,
      targetUrl: "{artist_url}",
      variables: ["artist_name", "artist_url"],
    },
    isOfficial: true,
  },
  {
    name: "Spotify Save Track",
    description: "Save a track to your Spotify library",
    category: "MUSIC",
    platform: "Spotify",
    taskType: "Like",
    templateData: {
      title: "Save Track to Spotify Library",
      description: "Save the specified track to your Spotify library.",
      requirements: [
        "Must have an active Spotify account",
        "Save the track to your library",
        "Take a screenshot showing the saved track",
      ],
      estimatedTime: 1,
      targetUrl: "{track_url}",
      variables: ["track_url"],
    },
    isOfficial: true,
  },
  {
    name: "SoundCloud Follow",
    description: "Follow an artist on SoundCloud",
    category: "MUSIC",
    platform: "SoundCloud",
    taskType: "Follow",
    templateData: {
      title: "Follow {artist_name} on SoundCloud",
      description: "Follow the artist on SoundCloud and submit proof.",
      requirements: [
        "Must have an active SoundCloud account",
        "Follow the specified artist",
        "Take a screenshot showing you followed",
      ],
      estimatedTime: 2,
      targetUrl: "{artist_url}",
      variables: ["artist_name", "artist_url"],
    },
    isOfficial: true,
  },

  // REVIEW Templates
  {
    name: "Google Review",
    description: "Leave a Google review for a business",
    category: "REVIEW",
    platform: "Google",
    taskType: "Review",
    templateData: {
      title: "Write Google Review for {business_name}",
      description: "Leave a detailed review for the business on Google.",
      requirements: [
        "Must have a Google account",
        "Review must be at least 50 words",
        "Review must be honest and detailed",
        "Include at least one photo (optional)",
        "Take a screenshot of your review",
      ],
      estimatedTime: 5,
      targetUrl: "{business_url}",
      variables: ["business_name", "business_url"],
    },
    isOfficial: true,
  },
  {
    name: "App Store Review",
    description: "Leave a review on the App Store",
    category: "REVIEW",
    platform: "App Store",
    taskType: "Review",
    templateData: {
      title: "Review {app_name} on App Store",
      description: "Download the app and leave a detailed review.",
      requirements: [
        "Must have an iOS device",
        "Download and use the app",
        "Leave a 5-star rating",
        "Write a review (at least 30 words)",
        "Take a screenshot of your review",
      ],
      estimatedTime: 10,
      targetUrl: "{app_url}",
      variables: ["app_name", "app_url"],
    },
    isOfficial: true,
  },

  // SURVEY Templates
  {
    name: "Quick Survey",
    description: "Complete a short survey",
    category: "SURVEY",
    taskType: "Survey",
    templateData: {
      title: "Complete {survey_name} Survey",
      description: "Fill out the survey completely and honestly.",
      requirements: [
        "Must complete all questions",
        "Provide honest answers",
        "Submit the survey",
        "Take a screenshot of completion page",
      ],
      estimatedTime: 5,
      targetUrl: "{survey_url}",
      variables: ["survey_name", "survey_url"],
    },
    isOfficial: true,
  },
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja";
    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB");

    // Clear existing templates
    await TaskTemplate.deleteMany({ isOfficial: true });
    console.log("Cleared existing official templates");

    // Insert new templates
    const result = await TaskTemplate.insertMany(templates);
    console.log(`✅ Successfully seeded ${result.length} templates`);

    // Display summary
    const summary = templates.reduce((acc: any, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});

    console.log("\nTemplates by category:");
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
