import { Router } from "express";
import { loginUser, registerUser } from "../controllers/userController";

export const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
