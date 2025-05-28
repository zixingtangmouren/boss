import { Entity } from '../../database/types';

export interface McpEntity extends Entity {
  mcpServerName: string;
  serverScriptPath: string;
  command: string;
}
