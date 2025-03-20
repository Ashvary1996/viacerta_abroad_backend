import Blog from "../models/blog.js";

const getBlogs = async (req, res) => {
  try {
    const allBlogs = await Blog.find({});

    if (allBlogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No blogs found.",
        totalBlogs: 0,
        blogs: [],
      });
    }

    res.status(200).json({
      success: true,
      totalBlogs: allBlogs.length,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};
export { getBlogs, getBlogById };
