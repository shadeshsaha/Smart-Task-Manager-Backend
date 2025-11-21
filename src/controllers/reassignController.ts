import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const reassignTasks = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: { tasks: true },
    });

    const logs: string[] = [];

    for (const member of members) {
      const overTasks = member.tasks.filter(
        (t) => t.priority !== "High" && member.tasks.length > member.capacity
      );
      for (const task of overTasks) {
        const freeMember = members.find((m) => m.tasks.length < m.capacity);
        if (!freeMember) continue;

        await prisma.task.update({
          where: { id: task.id },
          data: { assignedToId: freeMember.id },
        });

        const logMsg = `Task "${task.title}" reassigned from member ${member.userId} to ${freeMember.userId}`;
        logs.push(logMsg);
        await prisma.activityLog.create({ data: { message: logMsg } });
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
