import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodObject } from "zod";

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: err.errors });
    }
  };
