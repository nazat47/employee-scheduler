import { Router } from "express";
import { assignEmployees, createShift } from "../controllers/shift-controller";
import {
  authenticate,
  authorizePermissions,
} from "../middlewares/authentication";
import { Role } from "../models/employee";

const router = Router();

router.post("/", createShift);
router.patch(
  "/:id/assign/employee/:employeeId",
  authenticate,
  authorizePermissions([Role.HR]),
  assignEmployees
);

export default router;
