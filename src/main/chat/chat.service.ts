import { AgentsService } from '../agents/agents.service';
import { ChatDto } from './dto/chat.dto';
import { ModelsService } from '../models/models.service';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MemonyService } from '../memony/memony.service';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { McpService } from '../mcp/mcp.service';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';

export class ChatService {
  private agentsService: AgentsService;
  private modelsService: ModelsService;
  private memonyService: MemonyService;
  private mcpService: McpService;

  constructor(
    agentsService: AgentsService,
    modelsService: ModelsService,
    memonyService: MemonyService,
    mcpService: McpService
  ) {
    this.agentsService = agentsService;
    this.modelsService = modelsService;
    this.memonyService = memonyService;
    this.mcpService = mcpService;
  }

  async chat(chatDto: ChatDto) {
    const agentEntity = await this.agentsService.getAgent(chatDto.agentId);
    if (!agentEntity) {
      throw new Error('Agent not found');
    }

    const { modelId, prompt, id: agentId, mcpServerIds } = agentEntity;
    const memoryList = await this.memonyService.getMemoryListByAgentId(agentId);
    const llm = await this.modelsService.createModelInstance(modelId);
    if (!llm) {
      throw new Error('Model instance not found');
    }
    // 处理历史对话
    const historyMessages = memoryList.map((item) => {
      if (item.role === 'user') {
        return new HumanMessage(item.content);
      }
      return new AIMessage(item.content);
    });
    const historyMemory = new ChatMessageHistory(historyMessages);

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}']
    ]);

    // 处理 MCP 工具
    const tools = (await this.mcpService.getToolsByIds(mcpServerIds)).filter(Boolean).flat();
    console.log('tools >>>', tools);

    const agent = createToolCallingAgent({
      llm,
      prompt: promptTemplate,
      // @ts-ignore(langchain/core/tools/dynamic_structured_tool.ts)
      tools
    });

    const agentExecutor = new AgentExecutor({
      agent,
      // @ts-ignore(langchain/core/tools/dynamic_structured_tool.ts)
      tools
    });

    const agentWithChatHistory = new RunnableWithMessageHistory({
      runnable: agentExecutor,
      getMessageHistory: () => historyMemory,
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history'
    });

    const result = await agentWithChatHistory.stream(
      { input: chatDto.query },
      {
        configurable: { sessionId: '1' }
      }
    );

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
