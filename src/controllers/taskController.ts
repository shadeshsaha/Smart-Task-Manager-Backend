import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const createTask = async (req: Request, res: Response) => {
  // console.log("req.body", req.body);
  // console.log("req.file", req.file);
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

// export const getTasks = async (req: Request, res: Response) => {
//   console.log("req.body", req.body);
//   console.log("req.file", req.file);
//   try {
//     const { projectId, memberId } = req.query;
//     const where: any = {};
//     if (projectId) where.projectId = parseInt(projectId as string);
//     if (memberId) where.assignedToId = parseInt(memberId as string);

//     const tasks = await prisma.task.findMany({
//       // where,
//       // include: { assignedTo: true },
//       where: Object.keys(where).length ? where : undefined,
//       include: { assignedTo: true, project: true },
//     });
//     res.json({ tasks });
//   } catch (error: any) {
//     res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
//   }
// };

export const getTasks = async (req: Request, res: Response) => {
  const { status, priority, projectId } = req.query;

  const filters: any = {};

  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (projectId) filters.projectId = Number(projectId);

  const tasks = await prisma.task.findMany({
    where: filters,
  });
  console.log("tasks", tasks);

  res.json({ tasks });
};

// Auto-assign task to member with least load
export const autoAssignTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.body;

    // 1. Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(httpStatus.NOT_FOUND).json({ error: "Task not found" });
    }

    // 2. Ensure the task belongs to the same project
    if (task.projectId !== projectId) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Task does not belong to this project" });
    }

    // 3. Load project with team + members
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: {
              include: { tasks: true },
            },
          },
        },
      },
    });

    if (!project) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Project not found" });
    }

    // 4. Sort by current load
    const members = project.team.members;
    members.sort((a, b) => a.tasks.length - b.tasks.length);

    // 5. Find member with free capacity
    const member = members.find((m) => m.tasks.length < m.capacity);

    if (!member) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "All members over capacity" });
    }

    // 6. Safely assign task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: member.id },
    });

    res.json({
      message: `Task assigned to ${member.userId}`,
      task: updatedTask,
    });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
