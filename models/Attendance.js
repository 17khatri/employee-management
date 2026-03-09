import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  inTime: {
    type: String,
    required: true,
  },
  outTime: {
    type: String,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
