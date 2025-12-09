// Calculate reading time from content
export const calculateReadingTime = (content) => {
  if (!content) return 0;

  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "");

  // Count words
  const words = text.trim().split(/\s+/).length;

  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(words / 200);

  return minutes;
};

// Generate excerpt from content
export const generateExcerpt = (content, maxLength = 200) => {
  if (!content) return "";

  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "");

  // Trim and limit length
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength).trim() + "...";
};
