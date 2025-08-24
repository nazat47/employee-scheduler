import { Router } from "express";
import authRoute from "./auth-route";
import employeeRoute from "./employee-route";
import shiftRoute from "./shift-route";
import timeOffRoute from "./time-off-route";
import analyticsRoute from "./analytics-route";
import scheduleRoute from "./schedule-route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/employees",
    route: employeeRoute,
  },
  {
    path: "/shifts",
    route: shiftRoute,
  },
  {
    path: "/time-off",
    route: timeOffRoute,
  },
  {
    path: "/schedule",
    route: scheduleRoute,
  },
  {
    path: "/analytics",
    route: analyticsRoute,
  },
];

moduleRoutes.forEach((moduleRoute) =>
  router.use(moduleRoute.path, moduleRoute.route)
);

export default router;
