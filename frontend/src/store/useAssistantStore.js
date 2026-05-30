import { create } from "zustand";

const BASE_URL = "http://localhost:8000";

export const useAssistantStore = create((set, get) => ({
  messages: [
    {
      role: "assistant",
      content:
        "Hi! I'm your workflow assistant. Available nodes: Input, Output, Text, LLM, API Request, Condition, Delay, Database, Notification. Nodes auto-connect — no template syntax needed. What would you like to build?",
    },
  ],
  isOpen: false,
  isLoading: false,

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  sendMessage: async (text, workflowContext) => {
    const { messages, addMessage } = get();
    addMessage({ role: "user", content: text });
    set({ isLoading: true });

    try {
      const res = await fetch(`${BASE_URL}/api/v1/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          workflow_context: workflowContext,
        }),
      });
      const data = await res.json();
      addMessage(data);
    } catch {
      addMessage({
        role: "assistant",
        content:
          "Sorry, I couldn't reach the server. Make sure the backend is running on port 8000.",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearMessages: () =>
    set({
      messages: [
        {
          role: "assistant",
          content:
        "Hi! I'm your workflow assistant. Available nodes: Input, Output, Text, LLM, API Request, Condition, Delay, Database, Notification. Nodes auto-connect — no template syntax needed. What would you like to build?",
        },
      ],
    }),
}));
