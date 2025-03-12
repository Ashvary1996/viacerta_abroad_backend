import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
    },
    imageUrl: {
      type: String,
      required: true,
    },

    intro: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.models.blogs || mongoose.model("blogs", blogSchema);

export default Blog;
