import mongoose from "mongoose";
import { LEAVE_STATUS_VALUES } from "../app/constants/leave";

const LeaveSchema = new mongoose.Schema({
  emoloyeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  date: {
    type: Date,
    required: true,
  },
  leaveStatus: {
    type: String,
    enum: LEAVE_STATUS_VALUES,
  },
});

const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);

export default Leave;
