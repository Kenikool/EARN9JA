/**
 * URL Validation Service
 * Validates URLs and recognizes social media platform patterns
 */

interface ValidationResult {
  valid: boolean;
  platform?: string;
  message?: string;
  suggestions?: string[];
}

const SOCIAL_MEDIA_PATTERNS = {
  instagram: {
    patterns: [
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
      /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?$/,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?$/,
    ],
    examples: [
      "https://instagram.com/username",
      "https://www.instagram.com/username",
    ],
  },
  facebook: {
    patterns: [
      /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
      /^https?:\/\/(www\.)?fb\.com\/[a-zA-Z0-9.]+\/?$/,
    ],
    examples: [
      "https://facebook.com/pagename",
      "https://www.facebook.com/pagename",
    ],
  },
  twitter: {
    patterns: [
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/,
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/\d+\/?$/,
    ],
    examples: ["https://twitter.com/username", "https://x.com/username"],
  },
  tiktok: {
    patterns: [
      /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/,
      /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/video\/\d+\/?$/,
    ],
    examples: [
      "https://tiktok.com/@username",
      "https://www.tiktok.com/@username",
    ],
  },
  youtube: {
    patterns: [
      /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user)\/[a-zA-Z0-9_-]+\/?$/,
      /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+\/?$/,
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+$/,
      /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/,
    ],
    examples: [
      "https://youtube.com/@channelname",
      "https://www.youtube.com/watch?v=VIDEO_ID",
    ],
  },
  linkedin: {
    patterns: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9-]+\/?$/,
    ],
    examples: [
      "https://linkedin.com/in/username",
      "https://www.linkedin.com/company/companyname",
    ],
  },
  spotify: {
    patterns: [
      /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https?:\/\/open\.spotify\.com\/artist\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(\?.*)?$/,
    ],
    examples: [
      "https://open.spotify.com/track/TRACK_ID",
      "https://open.spotify.com/artist/ARTIST_ID",
    ],
  },
  soundcloud: {
    patterns: [/^https?:\/\/(www\.)?soundcloud\.com\/[a-zA-Z0-9-_]+\/?.*$/],
    examples: ["https://soundcloud.com/artist-name"],
  },
};

class UrlValidationService {
  /**
   * Validate URL format
   */
  validateFormat(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Detect platform from URL
   */
  detectPlatform(url: string): string | null {
    const lowerUrl = url.toLowerCase();

    for (const [platform, config] of Object.entries(SOCIAL_MEDIA_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(lowerUrl)) {
          return platform;
        }
      }
    }

    return null;
  }

  /**
   * Validate URL and provide suggestions
   */
  validate(url: string, expectedPlatform?: string): ValidationResult {
    // Check if URL is empty
    if (!url || url.trim() === "") {
      return {
        valid: false,
        message: "URL is required",
      };
    }

    // Check basic URL format
    if (!this.validateFormat(url)) {
      return {
        valid: false,
        message: "Invalid URL format. URL must start with http:// or https://",
        suggestions: ["https://example.com"],
      };
    }

    // Detect platform
    const detectedPlatform = this.detectPlatform(url);

    // If expected platform is specified, validate against it
    if (expectedPlatform) {
      const platformKey = expectedPlatform.toLowerCase();

      if (!detectedPlatform) {
        const config =
          SOCIAL_MEDIA_PATTERNS[
            platformKey as keyof typeof SOCIAL_MEDIA_PATTERNS
          ];
        return {
          valid: false,
          message: `URL doesn't match ${expectedPlatform} format`,
          suggestions: config?.examples || [],
        };
      }

      if (detectedPlatform !== platformKey) {
        return {
          valid: false,
          platform: detectedPlatform,
          message: `URL appears to be from ${detectedPlatform}, but ${expectedPlatform} was expected`,
        };
      }
    }

    // URL is valid
    return {
      valid: true,
      platform: detectedPlatform || undefined,
      message: detectedPlatform ? `Valid ${detectedPlatform} URL` : "Valid URL",
    };
  }

  /**
   * Get URL suggestions for a platform
   */
  getSuggestions(platform: string): string[] {
    const platformKey = platform.toLowerCase();
    const config =
      SOCIAL_MEDIA_PATTERNS[platformKey as keyof typeof SOCIAL_MEDIA_PATTERNS];
    return config?.examples || [];
  }

  /**
   * Auto-correct common URL mistakes
   */
  autoCorrect(url: string): string {
    let corrected = url.trim();

    // Add https:// if missing protocol
    if (!/^https?:\/\//i.test(corrected)) {
      corrected = `https://${corrected}`;
    }

    // Fix common typos
    corrected = corrected
      .replace(/^http:\/\/www\./, "https://www.")
      .replace(/^http:\/\//, "https://");

    return corrected;
  }
}

export const urlValidationService = new UrlValidationService();
