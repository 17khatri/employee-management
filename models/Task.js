import mongoose from "mongoose";
import { TASK_STATUS_VALUES } from "@/app/constants/task";
import { TASK_STATUSES } from "@/app/constants/task";

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: TASK_STATUS_VALUES,
    default: TASK_STATUSES.PENDING,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
});

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
