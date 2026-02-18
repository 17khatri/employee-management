import mongoose from "mongoose";
import { ROLE_VALUES } from "../app/constants/roles";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ROLE_VALUES,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

UserSchema.virtual("employee", {
  ref: "Employee",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
