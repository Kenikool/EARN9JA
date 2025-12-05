import mongoose, { Schema, Document } from "mongoose";

export interface ITaskImage extends Document {
  taskId: mongoose.Types.ObjectId;
  url: string;
  filename: string;
  size: number;
  order: number;
  createdAt: Date;
}

const TaskImageSchema: Schema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ITaskImage>("TaskImage", TaskImageSchema);
