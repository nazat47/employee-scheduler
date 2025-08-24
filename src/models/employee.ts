import mongoose, { Schema, Types } from "mongoose";

export enum Role {
  MANAGER = "manager",
  TEAM_LEAD = "team-lead",
  SENIOR_ENGINEER = "senior-engineer",
  ENGINEER = "engineer",
  DEVOPS = "devops",
  HR = "hr",
}

export enum EmploymentType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
}

export interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface EmployeeAttrs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  skills: string[];
  location: string;
  team: string;
  availability: AvailabilityWindow[];
}

export interface EmployeeDoc extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  skills: string[];
  location: string;
  team: string;
  availability: AvailabilityWindow[];
  createdAt: Date;
  updatedAt: Date;
}

interface EmployeeModel extends mongoose.Model<EmployeeDoc> {
  build: (attrs: EmployeeAttrs) => EmployeeDoc;
}

const availabilityWindowSchema = new Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
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
  },
  { _id: false }
);

const employeeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
    },
    skills: [
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
    employmentType: {
      type: String,
      required: true,
      enum: Object.values(EmploymentType),
    },
    availability: [availabilityWindowSchema],
  },
  {
    timestamps: true,
  }
);

employeeSchema.statics.build = (attrs: EmployeeAttrs) => {
  return new Employee(attrs);
};

export const Employee = mongoose.model<EmployeeDoc, EmployeeModel>(
  "Employee",
  employeeSchema
);
