import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const reassignTasks = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: { tasks: true, user: true },
    });

    const logs: string[] = [];

    for (const member of members) {
      const taskCount = member.tasks.length;
      if (taskCount <= member.capacity) {
        continue; // Skip if not overloaded
      }

      // Filter low and medium priority tasks that can be reassigned
      const overTasks = member.tasks.filter(
        // (t) => t.priority !== "High" && member.tasks.length > member.capacity
        (t) => t.priority !== "High"
      );

      // Calculate how many tasks need to be reassigned
      let excessTaskCount = taskCount - member.capacity;
      for (const task of overTasks) {
        if (excessTaskCount <= 0) {
          break;
        }

        const freeMember = members.find((m) => m.tasks.length < m.capacity);
        if (!freeMember) {
          break;
        }

        if (freeMember.id !== member.id) {
          // Reassign task
          await prisma.task.update({
            where: { id: task.id },
            data: { assignedToId: freeMember.id },
          });

          const logMsg = `Task "${task.title}" reassigned from ${member.user.name} to ${freeMember.user.name}`;
          logs.push(logMsg);
          await prisma.activityLog.create({ data: { message: logMsg } });

          // Update counts dynamically
          excessTaskCount--;
          // Update member tasks to reflect changes for accurate checks
          member.tasks = member.tasks.filter((t) => t.id !== task.id);
          freeMember.tasks.push(task);
        }
      }
    }

    res.json({ message: "Reassignment done", logs });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    res.json({ logs });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
