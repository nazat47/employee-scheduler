import mongoose, { Schema } from "mongoose";
import { Role } from "./employee";

export enum ShiftStatus {
  OPEN = "open",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

export interface ShiftAttrs {
  date: Date;
  startTime: string;
  endTime: string;
  roles: Role[];
  skillsRequired: string[];
  location: string;
  assignedEmployees?: string[];
  status?: string;
}

export interface ShiftDoc extends mongoose.Document {
  date: Date;
  startTime: string;
  endTime: string;
  roles: Role[];
  skillsRequired: string[];
  location: string;
  assignedEmployees: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  durationHours: number;
}

interface ShiftModel extends mongoose.Model<ShiftDoc> {
  build: (attrs: ShiftAttrs) => ShiftDoc;
}

const shiftSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    roles: [
      {
        type: String,
        enum: Object.values(Role),
      },
    ],
    skillsRequired: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    status: {
      type: String,
      enum: Object.values(ShiftStatus),
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

shiftSchema.virtual("durationHours").get(function () {
  const [startHour, startMin] = this.startTime.split(":").map(Number);
  const [endHour, endMin] = this.endTime.split(":").map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
});

shiftSchema.statics.build = (attrs: ShiftAttrs) => {
  return new Shift(attrs);
};

shiftSchema.index({ assignedEmployees: 1, status: 1, date: 1, startTime: 1 });
shiftSchema.index({ date: 1, startTime: 1 });
shiftSchema.index({ date: 1, location: 1, team: 1 });

export const Shift = mongoose.model<ShiftDoc, ShiftModel>("Shift", shiftSchema);
