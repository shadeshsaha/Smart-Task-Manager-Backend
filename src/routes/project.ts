import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController";
import { authenticate } from "../middlewares/auth";

export const projectRouter = Router();

projectRouter.post("/", authenticate, createProject);
projectRouter.get("/", authenticate, getProjects);
