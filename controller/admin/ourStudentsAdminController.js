import OurStudents from "../../models/ourStudents.js";

const newStudent = async (req, res) => {
  try {
    const {
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    } = req.body;

    const newStudent = new OurStudents({
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("❌ Error adding student:", error);
    res.status(400).json({
      success: false,
      message: "Error adding student",
      error: error.message,
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await OurStudents.find();
    res
      .status(200)
      .json({ success: true, totalStudents: students.length, students });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const {
      id,
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required for update.",
      });
    }

    const updatedStudent = await OurStudents.findByIdAndUpdate(
      id,
      {
        name,
        university,
        country,
        scholarship,
        scholarshipAmount,
        course,
        description,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID is required to delete." });
    }

    const deletedStudent = await OurStudents.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (error) {
    console.error("❌ Error deleting student:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { newStudent, getStudents, updateStudent, removeStudent };
