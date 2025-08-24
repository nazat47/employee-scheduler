import { NotFoundError } from "../errors";
import { Employee } from "../models/employee";

export const createEmployeeService = async () => {};

export const getEmployeeService = async (id: string) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }
  return employee;
};
