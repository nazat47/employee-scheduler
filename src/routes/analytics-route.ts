import { Router } from "express";
import {
  getAnalysis,
  getCoverage,
  getEmployeeWorkload,
} from "../controllers/analytics-controller";
import {
  authenticate,
  authorizePermissions,
} from "../middlewares/authentication";
import { Role } from "../models/employee";

const router = Router();

router.get(
  "/workload/:employeeId",
  authenticate,
  authorizePermissions([Role.HR, Role.MANAGER]),
  getEmployeeWorkload
);
router.get(
  "/coverage",
  authenticate,
  authorizePermissions([Role.HR, Role.MANAGER]),
  getCoverage
);
router.get(
  "/analyze",
  authenticate,
  authorizePermissions([Role.HR, Role.MANAGER]),
  getAnalysis
);

export default router;
