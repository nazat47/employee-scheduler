import { Request } from "express";
import { UserPayload } from "./user-payload";

export interface ExtendedRequest extends Request {
  user?: UserPayload;
}
