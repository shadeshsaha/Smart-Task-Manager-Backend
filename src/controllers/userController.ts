import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (req: Request, res: Response) => {
  try {
    // console.log("req.body", req.body);
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure the role matches Prisma enum
    const normalizedRole = role.toUpperCase();

    if (!["ADMIN", "USER"].includes(normalizedRole)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Use ADMIN or USER." });
    }

    const prismaRole = normalizedRole as "ADMIN" | "USER";

    const user = await prisma.user.create({
      data: { name, email, role: prismaRole, password: hashedPassword },
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "User registered", userId: user.id });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  } catch (error: any) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};
