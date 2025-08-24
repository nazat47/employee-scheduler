import { Router } from "express";
import { getDailySchedule } from "../controllers/schedule-controller";
import {
  authenticate,
  authorizePermissions,
} from "../middlewares/authentication";
import { Role } from "../models/employee";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizePermissions([Role.HR, Role.MANAGER]),
  getDailySchedule
);

export default router;
