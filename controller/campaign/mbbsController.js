import { addToSheet } from "../../config/googleConfig.js";
import MBBS_InterestedUser from "../../models/campaign/mbbs.js";

const newMBBS_InterestedUser = async (req, res) => {
  try {
    const { name, mobile, email, qualification, selectedCountry } = req.body;

    // Validate required fields
    if (!name || !mobile || !email || !qualification || !selectedCountry) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await MBBS_InterestedUser.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Save new user
    const newUser = new MBBS_InterestedUser({
      name,
      mobile,
      email,
      qualification,
      selectedCountry,
    });
    await newUser.save();

    // Send email notification
    // await sendEmail(process.env.EMAIL_SEND_TO, newUser, "mbbs_Users");
    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    await addToSheet(
      "mbbs",
      [
        name,
        mobile,
        email,
        qualification,
        selectedCountry.join(","),
        currentDate,
      ],
      [
        "Name",
        "Mobile",
        "Email",
        "Qualification",
        "Selected Country",
        "Timestamp",
      ]
    );
    res.status(201).json({
      success: true,
      message: "Entry created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("❌ Error creating entry:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllMbbsUsers = async (req, res) => {
  try {
    const users = await MBBS_InterestedUser.find({}).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, totalUsers: users.length, data: users });
  } catch (error) {
    console.error("❌ Error fetching entries:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { newMBBS_InterestedUser, getAllMbbsUsers };
