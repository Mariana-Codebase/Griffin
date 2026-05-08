// Structured JSON event logger. Emits one JSON object per line to stdout.
// The backend orchestrator consumes this stream to track tool calls and detect exploit success.

type EventType = "message_received" | "tool_called" | "tool_result" | "response_sent";

interface LogEvent {
  ts: string;
  type: EventType;
  session_id: string;
  payload: Record<string, unknown>;
}

function emit(type: EventType, session_id: string, payload: Record<string, unknown>): void {
  const event: LogEvent = { ts: new Date().toISOString(), type, session_id, payload };
  process.stdout.write(JSON.stringify(event) + "\n");
}

export const logger = {
  messageReceived: (session_id: string, message: string) =>
    emit("message_received", session_id, { message }),

  toolCalled: (session_id: string, tool: string, input: Record<string, unknown>) =>
    emit("tool_called", session_id, { tool, input }),

  toolResult: (session_id: string, tool: string, result: Record<string, unknown>) =>
    emit("tool_result", session_id, { tool, result }),

  responseSent: (session_id: string, response: string) =>
    emit("response_sent", session_id, { response }),
};
