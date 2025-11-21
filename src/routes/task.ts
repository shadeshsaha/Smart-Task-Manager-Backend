import { Router } from "express";
import {
  autoAssignTask,
  createTask,
  getTasks,
} from "../controllers/taskController";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import {
  autoAssignSchema,
  createTaskSchema,
} from "../validations/taskValidation";

export const taskRouter = Router();

taskRouter.post("/", authenticate, createTask);
taskRouter.get("/", authenticate, getTasks);
taskRouter.post("/auto-assign", authenticate, autoAssignTask);
taskRouter.post(
  "/",
  authenticate,
  upload.single("file"),
  validate(createTaskSchema),
  createTask
);
taskRouter.post(
  "/auto-assign",
  authenticate,
  validate(autoAssignSchema),
  autoAssignTask
);
