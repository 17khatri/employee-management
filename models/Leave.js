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
  },
  leaveStatus: {
    type: String,
    enum: LEAVE_STATUS_VALUES,
    default: "Pending",
  },
});

const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);

export default Leave;
