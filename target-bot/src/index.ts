import "dotenv/config";
import express, { Request, Response } from "express";
import { chat } from "./agent";
import { logger } from "./logger";

const app = express();
app.use(express.json());

app.post("/chat", async (req: Request, res: Response) => {
  const { message, session_id = "default" } = req.body as {
    message?: string;
    session_id?: string;
  };

  if (!message) {
    res.status(400).json({ error: "message required" });
    return;
  }

  logger.messageReceived(session_id, message);

  try {
    const response = await chat(message, session_id);
    logger.responseSent(session_id, response);
    res.json({ response, session_id });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errMsg });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  process.stderr.write(`target-bot listening on :${PORT}\n`);
});
