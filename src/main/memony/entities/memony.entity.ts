import { Entity } from '../../database/types';

export class MemoryEntity extends Entity {
  agentId: string;
  content: string;
  role: 'user' | 'agent';
}
