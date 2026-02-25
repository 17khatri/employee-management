import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Holiday =
  mongoose.models.Holiday || mongoose.model("Holiday", HolidaySchema);

export default Holiday;
