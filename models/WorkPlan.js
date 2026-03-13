import mongoose from "mongoose";

const WorkPlanSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const WorkPlan =
  mongoose.models.WorkPlan || mongoose.model("WorkPlan", WorkPlanSchema);

export default WorkPlan;
