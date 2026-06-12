import express from "express";
import healthRouter from "./routes/health.js";
import seedRouter from "./routes/seed.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", seedRouter);
app.use("/api", usersRouter);
app.use("/api", authRouter);

export default app;
