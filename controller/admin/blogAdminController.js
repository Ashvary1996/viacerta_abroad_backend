import Blog from "../../models/blog.js";

const createBlog = async (req, res) => {
  try {
    const { title, author, imageUrl, intro, description } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and image URL are required.",
      });
    }

    const newBlog = new Blog({
      title,
      author,
      imageUrl,
      intro,
      description,
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      blog: newBlog,
    });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({
      success: true,
      totalBlogs: blogs.length,
      blogs: blogs,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id, title, author, imageUrl, intro, description } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Blog ID is required to update." });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, author, imageUrl, intro, description },
      { new: true }
    );

    if (!updatedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found." });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      updatedBlog,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Blog ID is required to delete." });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully.", blog });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

export { createBlog, getAllBlog, updateBlog, deleteBlog };
