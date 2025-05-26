import { AgentsService } from '../agents/agents.service';
import { ChatDto } from './dto/chat.dto';
import { ModelsService } from '../models/models.service';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export class ChatService {
  private agentsService: AgentsService;
  private modelsService: ModelsService;

  constructor(agentsService: AgentsService, modelsService: ModelsService) {
    this.agentsService = agentsService;
    this.modelsService = modelsService;
  }

  async chat(chatDto: ChatDto) {
    const agent = await this.agentsService.getAgent(chatDto.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const { modelId, prompt } = agent;
    const llm = await this.modelsService.createModelInstance(modelId);
    if (!llm) {
      throw new Error('Model instance not found');
    }
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt],
      ['user', '{input}']
    ]);
    // @ts-ignore (langchain/core/prompts/chat_prompt_template.ts)
    const chain = promptTemplate.pipe(llm);
    const result = await chain.stream({ input: chatDto.query });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });

    return stream;
  }
}
