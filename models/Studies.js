import mongoose from "mongoose";

const StudySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
  },
  passingYear: {
    type: Number,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Study = mongoose.models.Study || mongoose.model("Study", StudySchema);

export default Study;
