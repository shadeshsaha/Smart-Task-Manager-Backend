import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface JwtPayload {
  id: number;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = payload.id;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Invalid token" });
  }
};
