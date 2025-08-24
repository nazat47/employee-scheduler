import { Router } from "express";
import {
  approveTimeoffRequest,
  createTimeOffRequest,
} from "../controllers/time-off-controller";
import { approveTimeOffValidator } from "../validators/time-off-validator";
import { Role } from "../models/employee";
import {
  authenticate,
  authorizePermissions,
} from "../middlewares/authentication";

const router = Router();

router.post("/", createTimeOffRequest);
router.patch(
  "/:id/approve",
  authenticate,
  authorizePermissions([Role.HR]),
  approveTimeOffValidator(),
  approveTimeoffRequest
);

export default router;
