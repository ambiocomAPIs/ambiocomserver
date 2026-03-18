import mongoose from "mongoose";

const TrafficLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    moduleName: {
      type: String,
      default: "general",
      trim: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    rol: {
      type: String,
      default: "Sin rol",
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("TrafficLog", TrafficLogSchema);