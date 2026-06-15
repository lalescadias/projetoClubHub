import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { authController } from "./auth.controller.js";
import { changePasswordSchema, loginSchema } from "./auth.schemas.js";

export const authRoutes = Router();

authRoutes.post("/login", validate({ body: loginSchema }), authController.login);
authRoutes.get("/me", authenticate, authController.me);
authRoutes.patch(
  "/password",
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);
