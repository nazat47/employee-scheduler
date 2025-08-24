import { body, query, param } from "express-validator";
import { handleValidationResult } from "./validation-check";

export const createEmployeeValidator = () => [handleValidationResult];
