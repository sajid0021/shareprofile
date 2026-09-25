import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    headline: { type: String, default: "", trim: true },
    about: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    skills: { type: [String], default: [] },
    profileImage: { type: String, default: "", maxlength: 2800000 },
  },
  { timestamps: true },
);

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);
