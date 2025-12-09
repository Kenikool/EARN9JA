const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

class VideoExtractor {
  constructor() {
    this.ytDlpPath = "yt-dlp"; // Assumes yt-dlp is in PATH
  }

  /**
   * Extract video information from URL
   */
  async getVideoInfo(url) {
    try {
      const command = `${this.ytDlpPath} --dump-json --no-playlist "${url}"`;
      const { stdout } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10,
      });

      const info = JSON.parse(stdout);

      return {
        id: info.id,
        title: info.title,
        description: info.description,
        thumbnail: info.thumbnail,
        duration: info.duration,
        uploader: info.uploader || info.channel,
        uploadDate: info.upload_date,
        viewCount: info.view_count,
        likeCount: info.like_count,
        formats: this.parseFormats(info.formats),
        url: info.webpage_url,
      };
    } catch (error) {
      throw new Error(`Failed to extract video info: ${error.message}`);
    }
  }

  /**
   * Get direct download URL for specific quality
   */
  async getDownloadUrl(url, quality = "best") {
    try {
      let formatSelector = "best";

      // Map quality to yt-dlp format selector
      switch (quality) {
        case "2160p":
        case "4k":
          formatSelector =
            "bestvideo[height<=2160]+bestaudio/best[height<=2160]";
          break;
        case "1440p":
          formatSelector =
            "bestvideo[height<=1440]+bestaudio/best[height<=1440]";
          break;
        case "1080p":
          formatSelector =
            "bestvideo[height<=1080]+bestaudio/best[height<=1080]";
          break;
        case "720p":
          formatSelector = "bestvideo[height<=720]+bestaudio/best[height<=720]";
          break;
        case "480p":
          formatSelector = "bestvideo[height<=480]+bestaudio/best[height<=480]";
          break;
        case "360p":
          formatSelector = "bestvideo[height<=360]+bestaudio/best[height<=360]";
          break;
        default:
          formatSelector = "best";
      }

      const command = `${this.ytDlpPath} -f "${formatSelector}" -g "${url}"`;
      const { stdout } = await execAsync(command);

      const urls = stdout.trim().split("\n");

      return {
        videoUrl: urls[0],
        audioUrl: urls.length > 1 ? urls[1] : null,
        quality,
        needsMerge: urls.length > 1,
      };
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  /**
   * Get available qualities for a video
   */
  async getAvailableQualities(url) {
    try {
      const command = `${this.ytDlpPath} -F "${url}"`;
      const { stdout } = await execAsync(command);

      const qualities = this.parseQualitiesFromOutput(stdout);
      return qualities;
    } catch (error) {
      throw new Error(`Failed to get available qualities: ${error.message}`);
    }
  }

  /**
   * Parse formats from video info
   */
  parseFormats(formats) {
    if (!formats || !Array.isArray(formats)) return [];

    const videoFormats = formats
      .filter((f) => f.vcodec !== "none" && f.height)
      .map((f) => ({
        formatId: f.format_id,
        quality: `${f.height}p`,
        height: f.height,
        width: f.width,
        ext: f.ext,
        filesize: f.filesize,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
      }))
      .sort((a, b) => b.height - a.height);

    // Remove duplicates by quality
    const uniqueQualities = [];
    const seenQualities = new Set();

    for (const format of videoFormats) {
      if (!seenQualities.has(format.quality)) {
        uniqueQualities.push(format);
        seenQualities.add(format.quality);
      }
    }

    return uniqueQualities;
  }

  /**
   * Parse qualities from yt-dlp output
   */
  parseQualitiesFromOutput(output) {
    const lines = output.split("\n");
    const qualities = [];
    const seenQualities = new Set();

    for (const line of lines) {
      const match = line.match(/(\d+)p/);
      if (match && !seenQualities.has(match[1])) {
        qualities.push(`${match[1]}p`);
        seenQualities.add(match[1]);
      }
    }

    return qualities.sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return bNum - aNum;
    });
  }

  /**
   * Check if yt-dlp is installed
   */
  async checkInstallation() {
    try {
      const { stdout } = await execAsync(`${this.ytDlpPath} --version`);
      return { installed: true, version: stdout.trim() };
    } catch (error) {
      return { installed: false, error: error.message };
    }
  }
}

module.exports = new VideoExtractor();
