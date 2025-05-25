import { Entity } from '../../database/types';

export interface AgentEntity extends Entity {
  name: string;
  description: string;
  prompt: string;
  icon: string;
}
