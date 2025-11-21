import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
});

export const addMemberSchema = z.object({
  teamId: z.number(),
  userId: z.number(),
  role: z.string().min(2),
  capacity: z.number().min(0).max(5),
});
