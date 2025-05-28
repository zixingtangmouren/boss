import { McpEntity } from '../entites/mcp.entity';

export type RegisterMcpServerDto = Omit<McpEntity, 'id' | 'createdAt' | 'updatedAt'>;
