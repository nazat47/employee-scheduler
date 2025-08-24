import { Response } from "express";
import { BadRequestError, UnauthorizedError } from "../errors";
import { AuthUtils } from "../utils/auth-utils";
import { Employee, EmployeeAttrs } from "../models/employee";

export const signUpService = async (data: EmployeeAttrs) => {
  const employeeExists = await Employee.findOne({ email: data.email });

  if (employeeExists) {
    throw new BadRequestError("Account already exists");
  }

  const hashedPassword = await AuthUtils.hashPassword(data.password as string);

  const employee = Employee.build({ ...data, password: hashedPassword });
  await employee.save();

  const employeeResponse = {
    _id: employee._id,
    name: employee.firstName + " " + employee.lastName,
    email: employee.email,
    skills: employee.skills,
    location: employee.location,
    team: employee.team,
    role: employee.role,
  };

  return {
    employee: employeeResponse,
  };
};

export const signInService = async (data: Partial<EmployeeAttrs>) => {
  const employee = await Employee.findOne({ email: data.email });
  if (!employee) {
    throw new BadRequestError("Invalid credentials");
  }

  const isPasswordValid = await AuthUtils.comparePassword({
    password: employee.password as string,
    candidatePassword: data.password as string,
  });

  if (!isPasswordValid) {
    throw new BadRequestError("Invalid credentials");
  }

  const tokenPayload = AuthUtils.createTokenPayload(employee);
  const accessToken = AuthUtils.createAccessToken(tokenPayload);
  const refreshToken = await AuthUtils.createOrUpdateRefreshToken({
    userId: employee._id as string,
  });

  return {
    employee,
    accessToken,
    refreshToken,
  };
};

export const regenerateTokenService = async (
  refreshToken: string,
  res: Response
) => {
  if (!refreshToken) {
    throw new UnauthorizedError("Access denied. Invalid refresh token");
  }

  const { isValid, employee } = await AuthUtils.validateRefreshToken(
    refreshToken
  );
  if (!isValid) {
    AuthUtils.clearCookie(res);
    throw new UnauthorizedError("Access denied. Please re-login to continue");
  }

  const tokenPayload = AuthUtils.createTokenPayload(employee!);
  const accessToken = AuthUtils.createAccessToken(tokenPayload);
  const newRefreshToken = await AuthUtils.createOrUpdateRefreshToken({
    userId: employee!._id as string,
  });

  const employeeResponse = {
    _id: employee!._id,
    name: employee!.firstName + " " + employee!.lastName,
    email: employee!.email,
    skills: employee!.skills,
    location: employee!.location,
    team: employee!.team,
    role: employee!.role,
  };

  return {
    employee: employeeResponse,
    accessToken,
    refreshToken: newRefreshToken,
  };
};
