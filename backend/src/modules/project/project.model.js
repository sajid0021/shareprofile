import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    technologies: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return value.every((item) => typeof item === "string" && item.trim().length >= 2);
        },
        message: "Each technology must be at least 2 characters long.",
      },
    },
    url: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator(value) {
          return !value || /^https?:\/\//i.test(value);
        },
        message: "Project URL must be a valid http or https URL.",
      },
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
