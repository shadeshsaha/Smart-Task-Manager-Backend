import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { projectRouter } from "./routes/project";
import { reassignRouter } from "./routes/reassign";
import { taskRouter } from "./routes/task";
import { teamRouter } from "./routes/team";
import { userRouter } from "./routes/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/teams", teamRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/reassign", reassignRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => res.send("Smart Task Manager API is running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
