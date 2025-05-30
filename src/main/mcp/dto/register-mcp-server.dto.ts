import { McpEntity } from '../entites/mcp.entity';

export type RegisterMcpServerDto = Record<
  string,
  Omit<McpEntity, 'id' | 'createdAt' | 'updatedAt'>
>;
