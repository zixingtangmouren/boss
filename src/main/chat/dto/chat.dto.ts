export interface ChatDto {
  query: string;
  inputs: Record<string, any>;
  agentId: string;
}
