 
import mongoose from "mongoose";

const OurStudentsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    university: { type: String, required: true },
    country: { type: String },
    scholarship: { type: String }, // Fully Funded, Partial, etc.
    description: { type: String, required: true },
    scholarshipAmount: { type: String },
    course: { type: String },
  },
  { timestamps: true }
);

const OurStudents =
  mongoose.models.ourstudents ||
  mongoose.model("ourstudents", OurStudentsSchema);

export default OurStudents;
