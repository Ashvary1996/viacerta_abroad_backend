import mongoose from "mongoose";
import validator from "validator";

const ALLOWED_COUNTRIES = [
  "Russia",
  "Kazakhstan",
  "Kyrgyzstan",
  "Philippines",
  "Uzbekistan",
  "Georgia",
];

const mbbsCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Please enter your phone number"],
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: "Phone number must be 10 digits",
      },
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Not a valid email address",
      },
    },
    qualification: {
      type: String,
      required: [true, "Please provide your qualification"],
      enum: ["12th exam", "neet Dropper"],
    },
    selectedCountry: {
      type: [String],
      validate: {
        validator: function (value) {
          if (value.length > 3) {
            return false;
          }

          return value.every((country) => ALLOWED_COUNTRIES.includes(country));
        },
        message: (props) => {
          if (props.value.length > 3) {
            return "You can select a maximum of 3 countries.";
          }

          const invalidCountries = props.value.filter(
            (country) => !ALLOWED_COUNTRIES.includes(country)
          );
          return `The following countries are not allowed: ${invalidCountries.join(
            ", "
          )}. Allowed countries are: ${ALLOWED_COUNTRIES.join(", ")}.`;
        },
      },
    },
  },
  { timestamps: true }
);

const MBBS_InterestedUser =
  mongoose.models.campaign_mbbs ||
  mongoose.model("campaign_mbbs", mbbsCampaignSchema);

export default MBBS_InterestedUser;
