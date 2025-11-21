import { Router } from "express";
import {
  getActivityLogs,
  reassignTasks,
} from "../controllers/reassignController";
import { authenticate } from "../middlewares/auth";

export const reassignRouter = Router();

reassignRouter.post("/", authenticate, reassignTasks);
reassignRouter.get("/logs", authenticate, getActivityLogs);
