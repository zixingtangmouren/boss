import { create } from 'zustand';
import { AgentEntity } from 'src/main/agents/entites/agent.entity';

export const useAgentsStore = create<{
  agents: AgentEntity[];
  setAgents: (agents: AgentEntity[]) => void;
  selectedAgent: AgentEntity | null;
  setSelectedAgent: (agent: AgentEntity) => void;
}>((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent })
}));
