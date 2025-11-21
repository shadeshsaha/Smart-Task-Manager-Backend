import { Router } from "express";
import {
  addTeamMember,
  createTeam,
  getTeamMembers,
} from "../controllers/teamController";
import { authenticate } from "../middlewares/auth";

export const teamRouter = Router();

teamRouter.post("/", authenticate, createTeam);
teamRouter.post("/member", authenticate, addTeamMember);
teamRouter.get("/:teamId/members", authenticate, getTeamMembers);
