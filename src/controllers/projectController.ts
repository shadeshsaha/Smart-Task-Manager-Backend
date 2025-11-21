import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../prisma";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, teamId } = req.body;

    const project = await prisma.project.create({
      data: { name, teamId },
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Project created", project });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true, team: true },
    });
    res.json({ projects });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
