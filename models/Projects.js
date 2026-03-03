import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

ProjectSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "projectId",
});

const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
