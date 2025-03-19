import mongoose from "mongoose";
import validator from "validator";

const EnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      // validate: {
      //   validator: validator.isEmail,
      //   message: "Not a valid email address",
      // },
    },

    mobile: {
      type: String,
      required: [true, "Please enter your phone number"],
      // validate: {
      //   validator: function (value) {
      //     return /^\d{10}$/.test(value);
      //   },
      //   message: "Phone number must be 10 digits",
      // },
    },
  },
  { timestamps: true }
);

const Enquiry_Form = mongoose.model("users_enquiry", EnquirySchema);

export default Enquiry_Form;
