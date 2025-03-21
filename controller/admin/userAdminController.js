import User from "../../models/users.js";

const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    const verifiedUsers = users.filter((user) => user.isVerified);
    const unverifiedUsers = users.filter((user) => !user.isVerified);

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      totalVerifiedUsers: verifiedUsers.length,
      totalUnverifiedUsers: unverifiedUsers.length,
      verifiedUsers,
      unverifiedUsers,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, name, email, mobile, address, role } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number already exists.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, mobile, address, role },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      user: deletedUser,
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { allUsers, updateUser, removeUser };
