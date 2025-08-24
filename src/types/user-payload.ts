import { Role } from "../models/employee";

export type UserPayload = {
  id: string;
  role: Role;
};
