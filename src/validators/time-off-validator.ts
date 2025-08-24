import { param } from "express-validator";
import { handleValidationResult } from "./validation-check";

export const approveTimeOffValidator = () => [
  param("id")
    .exists()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  handleValidationResult,
];
