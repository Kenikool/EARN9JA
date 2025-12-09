// Platform configuration for VidFlow
// Defines which platforms are legal vs restricted

const LEGAL_PLATFORMS = [
  "twitter",
  "reddit",
  "dailymotion",
  "vimeo",
  "soundcloud",
  "twitch",
];

const RESTRICTED_PLATFORMS = [
  "youtube",
  "instagram",
  "facebook",
  "tiktok",
  "snapchat",
];

const ALL_PLATFORMS = [...LEGAL_PLATFORMS, ...RESTRICTED_PLATFORMS];

const PLATFORM_PATTERNS = {
  youtube: /(?:youtube\.com|youtu\.be)/i,
  instagram: /instagram\.com/i,
  facebook: /facebook\.com|fb\.watch/i,
  tiktok: /tiktok\.com/i,
  twitter: /(?:twitter\.com|x\.com)/i,
  reddit: /reddit\.com/i,
  dailymotion: /dailymotion\.com/i,
  vimeo: /vimeo\.com/i,
  soundcloud: /soundcloud\.com/i,
  twitch: /twitch\.tv/i,
  snapchat: /snapchat\.com/i,
};

function detectPlatform(url) {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return "unknown";
}

function isPlatformAllowed(url, appVersion) {
  const platform = detectPlatform(url);

  if (platform === "unknown") {
    return { allowed: false, platform, reason: "Unknown platform" };
  }

  // PRO version allows all platforms
  if (appVersion === "pro") {
    return { allowed: true, platform };
  }

  // LITE version only allows legal platforms
  if (LEGAL_PLATFORMS.includes(platform)) {
    return { allowed: true, platform };
  }

  return {
    allowed: false,
    platform,
    reason: `${platform} is not available in VidFlow Lite. Upgrade to VidFlow Pro for full access.`,
  };
}

module.exports = {
  LEGAL_PLATFORMS,
  RESTRICTED_PLATFORMS,
  ALL_PLATFORMS,
  detectPlatform,
  isPlatformAllowed,
};
