import { Router } from "express";
import { vehicleRoutes } from "../modules/vehicles/vehicle.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireClubContext } from "../middlewares/club-context.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { clubRoutes } from "../modules/clubs/club.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "clubhub-api",
    timestamp: new Date().toISOString(),
  });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/clubs", authenticate, clubRoutes);
apiRoutes.use("/vehicles", authenticate, requireClubContext, vehicleRoutes);
apiRoutes.use("/users", authenticate, requireClubContext, userRoutes);
apiRoutes.use(
  "/notifications",
  authenticate,
  requireClubContext,
  notificationRoutes,
);
