import mongoose from "mongoose";
import {
  LEAVE_STATUS_VALUES,
  LEAVE_TYPES_VALUES,
} from "../app/constants/leave";

const LeaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
    enum: LEAVE_TYPES_VALUES,
    required: true,
  },
  leaveStatus: {
    type: String,
    enum: LEAVE_STATUS_VALUES,
    default: "Pending",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);

export default Leave;
