import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { userRouter } from "./routes/user";
// import { teamRouter } from "./routes/team";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
// app.use("/api/teams", teamRouter);

app.get("/", (req, res) => res.send("Smart Task Manager API is running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
