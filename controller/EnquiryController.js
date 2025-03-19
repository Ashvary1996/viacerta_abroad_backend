import Enquiry_Form from "../models/enquiryForm";

const createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await Enquiry_Form.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User has already booked counseling.",
      });
    }

    const user = new Enquiry_User({ name, email, mobile });
    await user.save();

    await sendEmail(process.env.EMAIL_SEND_TO, user, "counselingForm");

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Handle GET request - Fetch all users
const getAllEnquires = async (req, res) => {
  try {
    const users = await Enquiry_User.find();

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { createEnquiry, getAllEnquires };
