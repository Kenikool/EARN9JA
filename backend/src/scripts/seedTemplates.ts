import mongoose from "mongoose";
import { TaskTemplate } from "../models/TaskTemplate.js";
import dotenv from "dotenv";

dotenv.config();

const templates = [
  // ============================================
  // SOCIAL MEDIA TEMPLATES (3)
  // ============================================
  {
    name: "Instagram Follow & Like",
    description: "Get followers and likes on your Instagram post",
    category: "SOCIAL_MEDIA",
    platform: "INSTAGRAM",
    taskType: "FOLLOW",
    templateData: {
      title: "Follow my Instagram and like my latest post",
      description:
        "1. Follow my Instagram account @[your_username]\n2. Like my latest post\n3. Take a screenshot showing you followed and liked\n4. Submit the screenshot as proof",
      requirements: [
        "Must have an active Instagram account",
        "Follow the account and like the specified post",
        "Provide clear screenshot proof",
      ],
      estimatedTime: 3,
      targetUrl: "https://instagram.com/[your_username]",
      variables: ["your_username"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "TikTok Video Engagement",
    description: "Boost your TikTok video with likes, comments, and shares",
    category: "SOCIAL_MEDIA",
    platform: "TIKTOK",
    taskType: "LIKE",
    templateData: {
      title: "Like, comment, and share my TikTok video",
      description:
        "Help me boost my TikTok video engagement:\n1. Like my video\n2. Leave a positive comment\n3. Share the video to your story or with friends\n4. Screenshot all three actions as proof",
      requirements: [
        "Active TikTok account required",
        "Must complete all three actions (like, comment, share)",
        "Comment must be relevant and positive",
        "Provide screenshot proof of all actions",
      ],
      estimatedTime: 5,
      targetUrl: "https://tiktok.com/@[username]/video/[video_id]",
      variables: ["username", "video_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "YouTube Channel Growth",
    description: "Grow your YouTube channel with subscribers and video views",
    category: "SOCIAL_MEDIA",
    platform: "YOUTUBE",
    taskType: "FOLLOW",
    templateData: {
      title: "Subscribe to my YouTube channel and watch video",
      description:
        "Help grow my YouTube channel:\n1. Subscribe to my channel: [Channel Name]\n2. Watch my latest video for at least 2 minutes\n3. Like the video\n4. Leave a comment\n5. Screenshot showing subscription and engagement",
      requirements: [
        "Must have a YouTube account",
        "Subscribe and turn on notifications",
        "Watch video for minimum 2 minutes",
        "Leave a genuine comment",
        "Provide screenshot proof",
      ],
      estimatedTime: 5,
      targetUrl: "https://youtube.com/@[channel_name]",
      variables: ["channel_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },

  // ============================================
  // MUSIC STREAMING TEMPLATES (3)
  // ============================================
  {
    name: "Spotify Song Stream",
    description: "Get streams on your Spotify track",
    category: "MUSIC",
    platform: "SPOTIFY",
    taskType: "STREAM_SONG",
    templateData: {
      title: "Stream my song on Spotify (30 seconds minimum)",
      description:
        "Help me get streams on my new song:\n1. Open the Spotify link\n2. Play the song for at least 30 seconds\n3. Like/Heart the song\n4. Take a screenshot showing the song playing and liked\n5. Submit the screenshot",
      requirements: [
        "Must have Spotify account (free or premium)",
        "Play song for minimum 30 seconds",
        "Like/Heart the song",
        "Provide screenshot proof with timestamp visible",
      ],
      estimatedTime: 2,
      targetUrl: "https://open.spotify.com/track/[track_id]",
      variables: ["track_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "Audiomack Artist Follow & Stream",
    description: "Grow your Audiomack presence with followers and streams",
    category: "MUSIC",
    platform: "AUDIOMACK",
    taskType: "FOLLOW_ARTIST",
    templateData: {
      title: "Follow me on Audiomack and stream my latest track",
      description:
        "Support my music on Audiomack:\n1. Follow my artist profile\n2. Stream my latest song for at least 1 minute\n3. Add the song to your favorites\n4. Screenshot showing you followed and streamed",
      requirements: [
        "Active Audiomack account required",
        "Follow the artist profile",
        "Stream song for minimum 1 minute",
        "Add to favorites",
        "Provide clear screenshot proof",
      ],
      estimatedTime: 3,
      targetUrl: "https://audiomack.com/[artist_name]",
      variables: ["artist_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "Boomplay Playlist Addition",
    description: "Get your song added to user playlists on Boomplay",
    category: "MUSIC",
    platform: "BOOMPLAY",
    taskType: "ADD_TO_PLAYLIST",
    templateData: {
      title: "Add my song to your Boomplay playlist",
      description:
        "Help promote my music:\n1. Open the song link on Boomplay\n2. Add the song to one of your playlists\n3. Stream the song for at least 30 seconds\n4. Screenshot showing the song in your playlist",
      requirements: [
        "Must have Boomplay account",
        "Add song to an existing or new playlist",
        "Stream the song",
        "Provide screenshot of playlist with the song added",
      ],
      estimatedTime: 3,
      targetUrl: "https://www.boomplay.com/songs/[song_id]",
      variables: ["song_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },

  // ============================================
  // SURVEY TEMPLATES (3)
  // ============================================
  {
    name: "Quick Product Feedback Survey",
    description: "Short survey to gather product feedback",
    category: "SURVEY",
    platform: "PRODUCT_FEEDBACK",
    taskType: "SHORT_SURVEY",
    templateData: {
      title: "Quick 5-minute survey about [Product Name]",
      description:
        "We need your honest feedback about our product:\n1. Click the survey link\n2. Answer all questions honestly\n3. Complete the entire survey (5 minutes)\n4. Submit your responses\n5. Screenshot the completion page",
      requirements: [
        "Must be 18 years or older",
        "Answer all questions honestly",
        "Complete the entire survey",
        "Provide screenshot of completion confirmation",
      ],
      estimatedTime: 5,
      targetUrl: "https://forms.google.com/[form_id]",
      variables: ["form_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "Market Research Survey",
    description: "Medium-length survey for market research",
    category: "SURVEY",
    platform: "MARKET_RESEARCH",
    taskType: "MEDIUM_SURVEY",
    templateData: {
      title: "Market research survey - 10 minutes",
      description:
        "Help us understand consumer preferences:\n1. Access the survey link\n2. Provide demographic information\n3. Answer all questions thoughtfully\n4. Survey takes approximately 10 minutes\n5. Submit and screenshot confirmation",
      requirements: [
        "Must be Nigerian resident",
        "Age 18-65",
        "Provide honest and thoughtful responses",
        "Complete all required questions",
        "Screenshot completion page with confirmation code",
      ],
      estimatedTime: 10,
      targetUrl: "https://surveymonkey.com/r/[survey_id]",
      variables: ["survey_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "User Experience Feedback",
    description: "Detailed survey about user experience",
    category: "SURVEY",
    platform: "USER_EXPERIENCE",
    taskType: "LONG_SURVEY",
    templateData: {
      title: "Detailed UX feedback survey - 15 minutes",
      description:
        "Share your experience with our platform:\n1. Complete the comprehensive survey\n2. Provide detailed feedback on your experience\n3. Rate various aspects of the service\n4. Suggest improvements\n5. Submit and provide confirmation screenshot",
      requirements: [
        "Must have used the product/service",
        "Provide detailed, constructive feedback",
        "Complete all sections of the survey",
        "Survey takes 15-20 minutes",
        "Screenshot final confirmation page",
      ],
      estimatedTime: 15,
      targetUrl: "https://typeform.com/to/[form_id]",
      variables: ["form_id"],
    },
    usageCount: 0,
    isOfficial: true,
  },

  // ============================================
  // PRODUCT REVIEW TEMPLATES (3)
  // ============================================
  {
    name: "Google Business Review",
    description: "Get reviews for your Google Business listing",
    category: "REVIEW",
    platform: "GOOGLE_REVIEWS",
    taskType: "TEXT_REVIEW",
    templateData: {
      title: "Write a Google review for [Business Name]",
      description:
        "Help us build our online reputation:\n1. Visit our Google Business page\n2. Click 'Write a review'\n3. Give us a 5-star rating\n4. Write a detailed review (minimum 50 words)\n5. Submit the review\n6. Screenshot your published review",
      requirements: [
        "Must have a Google account",
        "Write minimum 50 words",
        "Review must be genuine and detailed",
        "5-star rating required",
        "Provide screenshot of published review",
      ],
      estimatedTime: 5,
      targetUrl: "https://g.page/[business_name]/review",
      variables: ["business_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "App Store Review with Screenshot",
    description: "Get app reviews on Google Play Store or Apple App Store",
    category: "REVIEW",
    platform: "PLAY_STORE",
    taskType: "PHOTO_REVIEW",
    templateData: {
      title: "Review our app on Play Store with screenshot",
      description:
        "Help us improve our app rating:\n1. Download and use the app for at least 5 minutes\n2. Go to Play Store and find our app\n3. Give a 5-star rating\n4. Write a review (minimum 50 words)\n5. Upload a screenshot of the app in use\n6. Submit and screenshot your review",
      requirements: [
        "Must download and test the app",
        "Use app for minimum 5 minutes",
        "Write detailed review with screenshot",
        "5-star rating required",
        "Provide screenshot of published review",
      ],
      estimatedTime: 10,
      targetUrl: "https://play.google.com/store/apps/details?id=[package_name]",
      variables: ["package_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "E-commerce Product Review",
    description: "Get product reviews on e-commerce platforms",
    category: "REVIEW",
    platform: "JUMIA",
    taskType: "TEXT_REVIEW",
    templateData: {
      title: "Write a product review on Jumia",
      description:
        "Share your experience with this product:\n1. Visit the product page on Jumia\n2. Click 'Write a Review'\n3. Give a 5-star rating\n4. Write a detailed review about the product (minimum 100 words)\n5. Mention specific features you liked\n6. Submit and screenshot your review",
      requirements: [
        "Must have Jumia account",
        "Write minimum 100 words",
        "Review must be detailed and helpful",
        "Mention specific product features",
        "5-star rating required",
        "Screenshot of published review",
      ],
      estimatedTime: 7,
      targetUrl: "https://www.jumia.com.ng/[product-url]",
      variables: ["product-url"],
    },
    usageCount: 0,
    isOfficial: true,
  },

  // ============================================
  // GAME TEMPLATES (3)
  // ============================================
  {
    name: "Mobile Game Download & Play",
    description: "Get users to download and play your mobile game",
    category: "GAME",
    platform: "ANDROID",
    taskType: "DOWNLOAD_PLAY",
    templateData: {
      title: "Download and play [Game Name] for 5 minutes",
      description:
        "Try out our new mobile game:\n1. Download the game from Play Store\n2. Install and open the game\n3. Play for at least 5 minutes\n4. Complete the tutorial if available\n5. Screenshot showing game installed and gameplay",
      requirements: [
        "Android device required",
        "Minimum 100MB free storage",
        "Play for at least 5 minutes",
        "Complete tutorial if prompted",
        "Provide screenshots: app installed + gameplay",
      ],
      estimatedTime: 10,
      targetUrl: "https://play.google.com/store/apps/details?id=[package_name]",
      variables: ["package_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "Game Level Achievement",
    description: "Reach a specific level in a mobile game",
    category: "GAME",
    platform: "BOTH",
    taskType: "REACH_LEVEL",
    templateData: {
      title: "Reach Level [X] in [Game Name]",
      description:
        "Show your gaming skills:\n1. Download and install the game\n2. Play and progress to Level [X]\n3. Take a screenshot showing you reached the level\n4. Screenshot must clearly show level number and your username\n5. Submit the proof",
      requirements: [
        "Download the game from official store",
        "Reach the specified level",
        "Screenshot must show level number clearly",
        "Include your in-game username in screenshot",
        "No cheating or hacks allowed",
      ],
      estimatedTime: 30,
      targetUrl: "https://play.google.com/store/apps/details?id=[package_name]",
      variables: ["package_name", "X"],
    },
    usageCount: 0,
    isOfficial: true,
  },
  {
    name: "Game Review & Rating",
    description: "Get reviews and ratings for your mobile game",
    category: "GAME",
    platform: "ANDROID",
    taskType: "GAME_REVIEW",
    templateData: {
      title: "Play and review [Game Name] on Play Store",
      description:
        "Help us improve our game:\n1. Download and play the game for at least 10 minutes\n2. Experience different game features\n3. Go to Play Store and write a review\n4. Give a 5-star rating\n5. Write detailed feedback (minimum 50 words)\n6. Screenshot your published review",
      requirements: [
        "Play game for minimum 10 minutes",
        "Try different game features",
        "Write detailed review (50+ words)",
        "5-star rating required",
        "Review must be genuine and helpful",
        "Screenshot of published review",
      ],
      estimatedTime: 15,
      targetUrl: "https://play.google.com/store/apps/details?id=[package_name]",
      variables: ["package_name"],
    },
    usageCount: 0,
    isOfficial: true,
  },
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing templates (optional - comment out if you want to keep existing ones)
    await TaskTemplate.deleteMany({ isOfficial: true });
    console.log("🗑️  Cleared existing official templates");

    // Insert new templates
    const result = await TaskTemplate.insertMany(templates);
    console.log(`✅ Successfully seeded ${result.length} templates`);

    // Display summary
    const summary = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📊 Templates by category:");
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} templates`);
    });

    console.log("\n✨ Template seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run the seed function
seedTemplates();
