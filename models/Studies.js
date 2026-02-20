import mongoose from "mongoose";

const StudySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  percentage: {
    type: String,
  },
  passingYear: {
    type: String,
    required: true,
  },
});

const Study = mongoose.models.Study || mongoose.model("Study", StudySchema);

export default Study;
