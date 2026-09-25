import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    // Each experience belongs to one authenticated user.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    startDate: {
      type: String,
      required: true,
    },

    endDate: {
      type: String,
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
  },
);

const Experience = mongoose.model("Experience", experienceSchema);

export default Experience;
