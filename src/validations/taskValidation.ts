import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Done"]),
  projectId: z.number(),
  assignedToId: z.number().optional(),
});

export const autoAssignSchema = z.object({
  projectId: z.number(),
  taskId: z.number(),
});
