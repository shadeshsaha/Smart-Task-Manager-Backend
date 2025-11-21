import { Router } from "express";
import {
  autoAssignTask,
  createTask,
  getTasks,
} from "../controllers/taskController";
import { authenticate } from "../middlewares/auth";

export const taskRouter = Router();

taskRouter.post("/", authenticate, createTask);
taskRouter.get("/", authenticate, getTasks);
taskRouter.post("/auto-assign", authenticate, autoAssignTask);
