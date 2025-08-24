import { body } from "express-validator";
import { handleValidationResult } from "./validation-check";
import { EmploymentType, Role } from "../models/employee";

export const signupValidator = () => [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters")
    .trim(),
  body("firstName")
    .exists()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name is in incorrect format")
    .trim(),
  body("lastName")
    .exists()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name is in incorrect format")
    .trim(),
  body("role")
    .exists()
    .withMessage("Role is required")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array of strings"),
  body("skills.*")
    .optional()
    .isString()
    .withMessage("Each skill must be a string"),
  body("location")
    .exists()
    .withMessage("Location is required")
    .isString()
    .withMessage("Location must be a string"),
  body("team")
    .exists()
    .withMessage("Team is required")
    .isString()
    .withMessage("Team must be a string"),
  body("employmentType")
    .exists()
    .withMessage("Employment type is required")
    .isIn(Object.values(EmploymentType))
    .withMessage(
      `Employment type must be one of: ${Object.values(EmploymentType).join(
        ", "
      )}`
    ),
  body("availability")
    .optional()
    .isArray()
    .withMessage("Availability must be an array"),
  body("availability.*.dayOfWeek")
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage("Day of week must be between 0 (Sunday) and 6 (Saturday)"),
  body("availability.*.startTime")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in hh:mm format (24-hour)"),
  body("availability.*.endTime")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in hh:mm format (24-hour)"),
  handleValidationResult,
];

export const loginValidator = () => [
  body("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationResult,
];
