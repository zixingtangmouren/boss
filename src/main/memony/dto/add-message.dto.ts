export class AddMessageDto {
  agentId: string;
  content: string;
  role: 'user' | 'agent';
}
