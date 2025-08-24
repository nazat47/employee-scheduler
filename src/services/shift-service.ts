import { BadRequestError, NotFoundError } from "../errors";
import { EmployeeDoc } from "../models/employee";
import { Shift, ShiftDoc, ShiftStatus } from "../models/shift";
import { TimeOff, TimeOffStatus } from "../models/time-off";
import { getEmployeeService } from "./employee-service";

const checkConflicts = async (shift: ShiftDoc, employee: EmployeeDoc) => {
  const shiftDay = new Date(shift.date).getDay();

  const isAvailable = employee.availability.some((window) => {
    if (window.dayOfWeek !== shiftDay) return false;
    return (
      window.startTime <= shift.startTime && window.endTime >= shift.endTime
    );
  });

  if (!isAvailable) {
    throw new BadRequestError(
      "Employee is not available during the shift's time"
    );
  }
  const overlappingShifts = await Shift.find({
    assignedEmployees: { $in: [employee._id] },
    date: shift.date,
    status: ShiftStatus.OPEN,
  });

  if (overlappingShifts.length > 0) {
    throw new BadRequestError(
      "Shift conflicts with the employee's other shift"
    );
  }

  const conflictingTimeOffs = await TimeOff.find({
    employee: employee._id,
    status: TimeOffStatus.APPROVED,
    $and: [
      { startDate: { $lte: shift.date } },
      { endDate: { $gte: shift.date } },
    ],
  });

  if (conflictingTimeOffs.length > 0) {
    throw new BadRequestError("Shift conflicts with the employee's time off");
  }
};

export const assignEmployeesService = async ({
  shiftId,
  empId,
}: {
  shiftId: string;
  empId: string;
}) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) {
    throw new NotFoundError("Shift not found");
  }

  const employee = await getEmployeeService(empId);

  const areRolesCompatible = shift.roles.includes(employee.role);
  if (!areRolesCompatible) {
    throw new BadRequestError("The employee can not work in this shift");
  }

  const areSkillsCompatible = shift.skillsRequired.every((skill) =>
    employee.skills.includes(skill)
  );

  if (!areSkillsCompatible) {
    throw new BadRequestError("The employee does not have the required skills");
  }

  await checkConflicts(shift, employee);

  if (!shift.assignedEmployees.includes(empId)) {
    shift.assignedEmployees.push(empId);
  }

  await shift.save();

  return shift;
};
