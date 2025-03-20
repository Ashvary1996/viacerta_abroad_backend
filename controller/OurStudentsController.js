import OurStudents from "../models/ourStudents.js";

const allStudents = async (req, res) => {
  try {
    const ourStudent = await OurStudents.find();

    res.status(200).json({
      success: true,
      totalStudents: ourStudent.length,
      ourStudent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "An error occurred",
    });
  }
};

export { allStudents };
