import { create } from 'zustand';

export type McpEntityWithStatus = {
  mcpServerId: string;
  mcpServerName: string;
  status: 'connected' | 'disconnected';
};

type McpServicesStore = {
  mcpServices: McpEntityWithStatus[];
  setMcpServices: (mcpServices: McpEntityWithStatus[]) => void;
};

export const useMcpServicesStore = create<McpServicesStore>((set) => ({
  mcpServices: [],
  setMcpServices: (mcpServices) => set({ mcpServices })
}));
