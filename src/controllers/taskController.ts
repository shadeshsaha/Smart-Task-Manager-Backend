import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, status, projectId, assignedToId } =
      req.body;
    const file = req.file?.filename; // get uploaded file name

    // Capacity check
    if (assignedToId) {
      const member = await prisma.teamMember.findUnique({
        where: { id: parseInt(assignedToId) },
        include: { tasks: true },
      });
      if (member && member.tasks.length >= member.capacity) {
        return res.status(httpStatus.BAD_REQUEST).json({
          warning: `${member.userId} has ${member.tasks.length} tasks but capacity is ${member.capacity}. Assign anyway?`,
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        projectId: parseInt(projectId),
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        // store file if any
        ...(file && { attachment: file }),
      },
    });

    res.status(httpStatus.CREATED).json({ message: "Task created", task });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.query;
    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId as string);
    if (memberId) where.assignedToId = parseInt(memberId as string);

    const tasks = await prisma.task.findMany({
      where,
      include: { assignedTo: true },
    });
    res.json({ tasks });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

// Auto-assign task to member with least load
export const autoAssignTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: { include: { tasks: true } } } } },
    });
    if (!project)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Project not found" });

    const members = project.team.members;
    members.sort((a, b) => a.tasks.length - b.tasks.length); // least tasks first

    const member = members.find((m) => m.tasks.length < m.capacity);
    if (!member)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "All members over capacity" });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: member.id },
    });

    res.json({ message: `Task assigned to ${member.userId}`, task });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
