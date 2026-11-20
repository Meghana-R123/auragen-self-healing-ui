import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { calculateFrictionScore } from "./telemetry/score.js";
import { generateReactComponent } from "./ai/generateComponent.js";

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "100kb" }));

const io = new Server(httpServer, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AuraGen Week 1 API" });
});

app.post("/api/generate-ui", async (req, res) => {
  const { task, formContext } = req.body || {};
  if (typeof task !== "string" || task.trim().length < 10) {
    return res.status(400).json({ error: "Please provide a task with at least 10 characters." });
  }

  try {
    const code = await generateReactComponent({ task: task.trim(), formContext });
    return res.json({ code, model: process.env.OPENAI_MODEL || "gpt-4o" });
  } catch (error) {
    console.error("UI generation error:", error.message);
    return res.status(error.status || 500).json({ error: error.message || "Component generation failed." });
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("telemetry", (payload = {}) => {
    const score = calculateFrictionScore(payload.signals || {});
    const update = {
      clientId: socket.id,
      timestamp: new Date().toISOString(),
      score,
      level: score >= 70 ? "high" : score >= 40 ? "moderate" : "low",
      signals: payload.signals || {}
    };
    io.emit("telemetry:update", update);
  });

  socket.on("disconnect", () => console.log(`Client disconnected: ${socket.id}`));
});

httpServer.listen(port, () => {
  console.log(`AuraGen API + Socket.IO listening on http://localhost:${port}`);
});
