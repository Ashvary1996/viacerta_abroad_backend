import Enquiry_Form from "../models/enquiryForm.js";
import { addToSheet } from "../config/googleConfig.js";

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

    const user = new Enquiry_Form({ name, email, mobile });
    await user.save();

    // await sendEmail(process.env.EMAIL_SEND_TO, user, "counselingForm");
    const currentDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    await addToSheet(
      "enquiry",
      [name, email, mobile,  currentDate],
      ["Name", "Email", "Mobile", "Timestamp"]
    );

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

const getAllEnquires = async (req, res) => {
  try {
    const users = await Enquiry_Form.find({});

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
