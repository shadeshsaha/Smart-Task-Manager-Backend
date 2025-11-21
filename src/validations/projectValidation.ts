import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  teamId: z.number(),
});
