import slugifyLib from "slugify";
import Post from "../models/Post.js";

// Generate slug from title
export const generateSlug = (title) => {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

// Ensure slug is unique
export const ensureUniqueSlug = async (title, postId = null) => {
  let slug = generateSlug(title);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = { slug };
    if (postId) {
      query._id = { $ne: postId };
    }

    const existingPost = await Post.findOne(query);

    if (!existingPost) {
      isUnique = true;
    } else {
      slug = `${generateSlug(title)}-${counter}`;
      counter++;
    }
  }

  return slug;
};
