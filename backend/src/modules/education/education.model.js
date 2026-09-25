import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Education || mongoose.model("Education", educationSchema);
