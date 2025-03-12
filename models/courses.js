import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    admissionClosingDate: {
      type: String,
      required: true,
    },
    universityName: {
      type: String,
      required: true,
    },
    destinationCountry: {
      type: String,
      required: true,
    },
    postStudyWorkVisaEligibility: {
      type: String,
      required: true,
    },
    tuitionFeesOnCampus: {
      type: String,
      required: true,
    },
    durationOnCampus: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Course =
  mongoose.models.courses || mongoose.model("courses", courseSchema);

export default Course;
