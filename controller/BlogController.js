import Blog from "../models/blog";

const getBlogs = async (req, res) => {
  try {
    const allBlogs = await Blog.find();

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

export { getBlogs };
