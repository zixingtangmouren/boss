import { Entity } from '../../database/types';

export interface McpEntity extends Entity {
  serverName: string;
  url: string;
  command: string;
  env: Record<string, string>;
  args: string[];
}
