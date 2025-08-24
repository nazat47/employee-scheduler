import mongoose, { Schema, Types } from "mongoose";

export enum TimeOffStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface TimeOffAttrs {
  employee: string;
  startDate: Date;
  endDate: Date;
  status: TimeOffStatus;
}

export interface TimeOffDoc extends mongoose.Document {
  employee: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: TimeOffStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface TimeOffModel extends mongoose.Model<TimeOffDoc> {
  build: (attrs: TimeOffAttrs) => TimeOffDoc;
}

const timeOffSchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TimeOffStatus),
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

timeOffSchema.statics.build = (attrs: TimeOffAttrs) => {
  return new TimeOff(attrs);
};

timeOffSchema.index({ employee: 1, status: 1, startDate: 1, endDate: 1 });
timeOffSchema.index({ employee: 1, startDate: 1 });

export const TimeOff = mongoose.model<TimeOffDoc, TimeOffModel>(
  "TimeOff",
  timeOffSchema
);
