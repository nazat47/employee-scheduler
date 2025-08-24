import { Request, Response } from "express";
import { getDailyScheduleService } from "../services/schedule-service";

export const getDailySchedule = async (req: Request, res: Response) => {
  const { page, limit, date, team, location } = req.query;
  const { schedules, pagination } = await getDailyScheduleService({
    page: Number(page),
    limit: Number(limit),
    date: date as string,
    team: team as string,
    location: location as string,
  });

  return res.status(200).json({ schedules, pagination });
};
