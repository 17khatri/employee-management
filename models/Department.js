import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Department =
  mongoose.models.Department || mongoose.model("Department", DepartmentSchema);

export default Department;
