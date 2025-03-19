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

// ✅ DELETE: Remove a user
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

const removeAllUnverifiedUsers = async (req, res) => {
  try {
    const deleteResult = await User.deleteMany({ isVerified: false });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No unverified users found to delete.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} unverified users.`,
      deleteResult,
    });
  } catch (error) {
    console.error("❌ Error deleting unverified users:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

export { allUsers, updateUser, removeUser, removeAllUnverifiedUsers };
