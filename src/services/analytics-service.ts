import { FilterQuery } from "mongoose";
import { Shift, ShiftDoc, ShiftStatus } from "../models/shift";
import { Employee } from "../models/employee";
import { BadRequestError } from "../errors";

type WeeklyHours = {
  [weekKey: string]: {
    weekStart: Date;
    hours: number;
    shifts: ShiftDoc[];
  };
};

function getWeekStart(date: Date, weekStart = 5) {
  const d = date;
  const day = d.getDay();
  d.setDate(d.getDate() - ((day - weekStart + 7) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getEmployeeWorkloadService = async ({
  employeeId,
  startDate,
  endDate,
}: {
  employeeId: string;
  startDate: string;
  endDate: string;
}) => {
  if (!startDate || !endDate) {
    throw new BadRequestError("Start date and end date are required");
  }

  const shifts = await Shift.find({
    assignedEmployees: employeeId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: { $in: [ShiftStatus.CLOSED, ShiftStatus.OPEN] },
  }).sort({ date: 1, startTime: 1 });

  const employee = await Employee.findById(employeeId).select(
    "firstName lastName employeeId maxHoursPerWeek"
  );

  const totalHours = shifts.reduce((sum, shift) => {
    return sum + shift.durationHours;
  }, 0);

  const weeklyHours: WeeklyHours = {};

  shifts.forEach((shift: ShiftDoc) => {
    const weekStart = getWeekStart(shift.date);
    const weekKey = weekStart.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

    if (!weeklyHours[weekKey]) {
      weeklyHours[weekKey] = {
        weekStart,
        hours: 0,
        shifts: [],
      };
    }

    weeklyHours[weekKey].hours += shift.durationHours;
    weeklyHours[weekKey].shifts.push(shift);
  });

  return {
    employee,
    period: { startDate, endDate },
    totalHours,
    totalShifts: shifts.length,
    shifts,
    weeklyData: Object.values(weeklyHours),
  };
};

export const getCoverageService = async ({
  id,
  date,
  location,
  team,
  page = 1,
  limit = 10,
}: {
  id?: string;
  date?: string;
  location?: string;
  team?: string;
  page?: number;
  limit?: number;
}) => {
  const skip = ((page > 0 ? page : 1) - 1) * limit;
  const matchQuery: FilterQuery<ShiftDoc> = {};

  if (id) matchQuery._id = id;
  if (date) matchQuery.date = new Date(date);
  if (location) matchQuery.location = location;
  if (team) matchQuery.team = team;

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "employees",
        localField: "assignedEmployees",
        foreignField: "_id",
        as: "assignedEmployees",
      },
    },
    {
      $addFields: {
        requiredRolesCount: { $size: { $ifNull: ["$roles", []] } },
        assignedRoles: {
          $map: {
            input: { $ifNull: ["$assignedEmployees", []] },
            as: "emp",
            in: "$$emp.role",
          },
        },
      },
    },
    {
      $addFields: {
        uniqueAssignedRoles: { $setUnion: ["$assignedRoles", []] },
        assignedRolesCount: { $size: { $setUnion: ["$assignedRoles", []] } },
        missingRoles: {
          $setDifference: [
            { $ifNull: ["$roles", []] },
            { $setUnion: ["$assignedRoles", []] },
          ],
        },
        missingRolesCount: { $size: { $ifNull: ["$missingRoles", []] } },
      },
    },
    {
      $addFields: {
        coveragePercentage: {
          $cond: [
            { $eq: ["$requiredRolesCount", 0] },
            100,
            {
              $multiply: [
                { $divide: ["$assignedRolesCount", "$requiredRolesCount"] },
                100,
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        location: 1,
        team: 1,
        status: 1,
        roles: 1,
        requiredRolesCount: 1,
        assignedRolesCount: 1,
        missingRolesCount: 1,
        coveragePercentage: { $round: ["$coveragePercentage", 1] },
        missingRoles: 1,
        assignedEmployees: {
          $map: {
            input: "$assignedEmployees",
            as: "emp",
            in: {
              _id: "$$emp._id",
              firstName: "$$emp.firstName",
              lastName: "$$emp.lastName",
              role: "$$emp.role",
            },
          },
        },
      },
    },
    { $sort: { date: 1 as 1, startTime: 1 as 1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const coverageData = await Shift.aggregate(pipeline);
  const total = await Shift.countDocuments(matchQuery);

  return {
    shifts: coverageData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getAnalysisService = async ({
  date,
  location,
}: {
  date?: string;
  location?: string;
}) => {
  const matchQuery: FilterQuery<ShiftDoc> = {};
  if (date) matchQuery.date = new Date(date);
  if (location) matchQuery.location = location;

  const pipeline = [
    { $match: matchQuery },
    {
      $addFields: {
        hourBlocks: {
          $range: [
            { $toInt: { $substr: ["$startTime", 0, 2] } },
            { $add: [{ $toInt: { $substr: ["$endTime", 0, 2] } }, 1] },
          ],
        },
      },
    },
    { $unwind: "$hourBlocks" },
    { $unwind: "$roles" },
    {
      $lookup: {
        from: "employees",
        localField: "assignedEmployees",
        foreignField: "_id",
        as: "assignedEmployees",
      },
    },
    {
      $lookup: {
        from: "timeoffs",
        let: {
          empIds: "$assignedEmployees._id",
          shiftDate: "$date",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$employee", "$$empIds"] },
                  { $eq: ["$status", "approved"] },
                  { $lte: ["$startDate", "$$shiftDate"] },
                  { $gte: ["$endDate", "$$shiftDate"] },
                ],
              },
            },
          },
        ],
        as: "timeOffConflicts",
      },
    },
    {
      $addFields: {
        roleCovered: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$assignedEmployees",
                  as: "emp",
                  cond: { $eq: ["$$emp.role", "$roles"] },
                },
              },
            },
            0,
          ],
        },
        hasConflict: { $gt: [{ $size: "$timeOffConflicts" }, 0] },
        conflictedEmployees: {
          $map: {
            input: "$timeOffConflicts",
            as: "timeOff",
            in: "$$timeOff.employee",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          location: "$location",
          role: "$roles",
          hour: "$hourBlocks",
        },
        totalShifts: { $sum: 1 },
        coveredShifts: {
          $sum: {
            $cond: [{ $and: ["$roleCovered", { $not: "$hasConflict" }] }, 1, 0],
          },
        },
        conflictedShifts: {
          $sum: {
            $cond: ["$hasConflict", 1, 0],
          },
        },
        uncoveredShifts: {
          $sum: {
            $cond: [{ $not: "$roleCovered" }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        coveragePercentage: {
          $multiply: [{ $divide: ["$coveredShifts", "$totalShifts"] }, 100],
        },
        conflictPercentage: {
          $multiply: [{ $divide: ["$conflictedShifts", "$totalShifts"] }, 100],
        },
        utilizationScore: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$coveredShifts", "$conflictedShifts"] },
                "$totalShifts",
              ],
            },
            100,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          location: "$_id.location",
          role: "$_id.role",
        },
        location: { $first: "$_id.location" },
        role: { $first: "$_id.role" },
        totalShifts: { $sum: "$totalShifts" },
        totalCovered: { $sum: "$coveredShifts" },
        totalConflicts: { $sum: "$conflictedShifts" },
        totalUncovered: { $sum: "$uncoveredShifts" },
        hourlyBreakdown: {
          $push: {
            hour: "$_id.hour",
            totalShifts: "$totalShifts",
            coveredShifts: "$coveredShifts",
            conflictedShifts: "$conflictedShifts",
            uncoveredShifts: "$uncoveredShifts",
            coveragePercentage: { $round: ["$coveragePercentage", 1] },
            conflictPercentage: { $round: ["$conflictPercentage", 1] },
            utilizationScore: { $round: ["$utilizationScore", 1] },
          },
        },
      },
    },
    {
      $addFields: {
        overallCoverage: {
          $multiply: [{ $divide: ["$totalCovered", "$totalShifts"] }, 100],
        },
        overallConflicts: {
          $multiply: [{ $divide: ["$totalConflicts", "$totalShifts"] }, 100],
        },
        overallUtilization: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$totalCovered", "$totalConflicts"] },
                "$totalShifts",
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { location: 1 as 1, role: 1 as 1 } },
  ];

  const analysisData = await Shift.aggregate(pipeline);

  const summary = analysisData.reduce(
    (acc, item) => {
      acc.totalShifts += item.totalShifts;
      acc.totalCovered += item.totalCovered;
      acc.totalConflicts += item.totalConflicts;
      acc.totalUncovered += item.totalUncovered;
      return acc;
    },
    {
      totalShifts: 0,
      totalCovered: 0,
      totalConflicts: 0,
      totalUncovered: 0,
    }
  );

  summary.overallCoverage =
    summary.totalShifts > 0
      ? ((summary.totalCovered / summary.totalShifts) * 100).toFixed(1)
      : 0;
  summary.overallConflicts =
    summary.totalShifts > 0
      ? ((summary.totalConflicts / summary.totalShifts) * 100).toFixed(1)
      : 0;
  summary.overallUtilization =
    summary.totalShifts > 0
      ? (
          ((summary.totalCovered - summary.totalConflicts) /
            summary.totalShifts) *
          100
        ).toFixed(1)
      : 0;

  return {
    summary,
    roleAnalysis: analysisData,
  };
};
