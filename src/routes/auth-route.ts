import { Router } from "express";
import {
  logout,
  regenerateToken,
  signIn,
  signUp,
} from "../controllers/auth-controller";
import { loginValidator, signupValidator } from "../validators/auth-validators";

const router = Router();

router.route("/signup").post(signupValidator(), signUp);
router.route("/signIn").post(loginValidator(), signIn);
router.route("/logout").post(logout);
router.route("/refresh").post(regenerateToken);
export default router;
