import { FilterQuery } from "mongoose";
import { BadRequestError } from "../errors";
import { Shift, ShiftDoc } from "../models/shift";

export const getDailyScheduleService = async ({
  page = 1,
  limit = 10,
  date,
  team,
  location,
}: {
  page: number;
  limit: number;
  date: string;
  team: string;
  location: string;
}) => {
  const skip = ((page > 0 ? page : 1) - 1) * limit;

  if (!date) {
    throw new BadRequestError("Date is required");
  }

  const matchStage: FilterQuery<ShiftDoc> = { date: new Date(date) };
  if (location) matchStage.location = location;
  if (team) matchStage.team = team;

  const schedules = await Shift.find(matchStage)
    .skip(skip)
    .limit(limit)
    .sort({ startTime: 1 });

  const total = await Shift.countDocuments(matchStage);

  return {
    schedules,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
