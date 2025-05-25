import { AgentEntity } from '../entites/agent.entity';

export type CreateAgentDto = Omit<AgentEntity, 'id' | 'createdAt' | 'updatedAt'>;
