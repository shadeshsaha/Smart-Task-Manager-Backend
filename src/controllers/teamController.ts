import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    const team = await prisma.team.create({
      data: {
        name,
        ownerId: userId,
      },
    });

    res.status(httpStatus.CREATED).json({ message: "Team created", team });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId, userId, role, capacity } = req.body;

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
        capacity,
      },
    });

    res.status(httpStatus.CREATED).json({ message: "Member added", member });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);

    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: { user: true, tasks: true },
    });

    res.json({ members });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
