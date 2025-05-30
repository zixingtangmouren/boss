import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable, RunnableWithMessageHistory } from '@langchain/core/runnables';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { AgentsService } from '../agents/agents.service';
import { McpService } from '../mcp/mcp.service';
import { MemonyService } from '../memony/memony.service';
import { ModelsService } from '../models/models.service';
import { ChatDto } from './dto/chat.dto';

export class ChatService {
  private agentsService: AgentsService;
  private modelsService: ModelsService;
  private memonyService: MemonyService;
  private mcpService: McpService;

  private runnableMap: Map<string, Runnable> = new Map();

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
    const { agentId, query } = chatDto;

    const runnable = await this.getRunnable(agentId);
    if (!runnable) {
      throw new Error('Runnable not found');
    }

    const result = await runnable.stream(
      { input: query },
      {
        configurable: { sessionId: '1' }
      }
    );

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          // 筛选出哪些是需要给到用户的
          console.log('chunk >>>', chunk);
          if (typeof chunk.output === 'string') {
            controller.enqueue(chunk.output);
          }
        }
        controller.close();
      }
    });

    return stream;
  }

  async getRunnable(agentId: string) {
    if (this.runnableMap.has(agentId)) {
      return this.runnableMap.get(agentId);
    }

    // 获取 agent 信息
    const agentEntity = await this.agentsService.getAgent(agentId);
    if (!agentEntity) {
      throw new Error('Agent not found');
    }

    console.log('agentEntity >>>', agentEntity);

    const { modelId, prompt: agentPrompt, mcpServerIds } = agentEntity;

    // 创建模型实例
    const llm = await this.modelsService.createModelInstance(modelId);
    if (!llm) {
      throw new Error('Model instance not found');
    }

    // 处理历史对话 TODO: 这个逻辑后续应该交给 MemonyService 处理（记录管理每个 Agent 的对话历史）
    const memoryList = await this.memonyService.getMemoryListByAgentId(agentId);
    const historyMessages = memoryList.map((item) => {
      if (item.role === 'user') {
        return new HumanMessage(item.content);
      }
      return new AIMessage(item.content);
    });
    const historyMemory = new ChatMessageHistory(historyMessages);

    const promptMessages: (string | [string, string])[] = [
      ['system', agentPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}']
    ];

    if (mcpServerIds.length) {
      promptMessages.push(['placeholder', '{agent_scratchpad}']);
      // 生成 prompt
      const prompt = ChatPromptTemplate.fromMessages(promptMessages);
      // 处理 MCP 工具
      const tls = await this.mcpService.getToolsByIds(mcpServerIds);
      console.log('tools >>>', tls);

      // const getWeatherTool = new DynamicStructuredTool({
      //   name: 'getWeather',
      //   description: 'get weather',
      //   schema: z.object({
      //     city: z.string().describe('the city to get weather')
      //   }),
      //   func: async ({ city }) => {
      //     console.log('getWeatherTool >>>', city);
      //     return `The weather in ${city} is sunny`;
      //   }
      // });

      const tools = [
        // getWeatherTool
        ...tls
      ];

      const agent = await createToolCallingAgent({
        llm,
        // @ts-ignore(TODO: 后续需要优化)
        tools,
        prompt
      });

      const agentExecutor = new AgentExecutor({
        agent,
        // @ts-ignore(TODO: 后续需要优化)
        tools
      });

      const runnable = new RunnableWithMessageHistory({
        runnable: agentExecutor,
        getMessageHistory: () => historyMemory,
        inputMessagesKey: 'input',
        historyMessagesKey: 'chat_history'
      });

      this.runnableMap.set(agentId, runnable);
      return runnable;
    } else {
      // 生成 prompt
      const prompt = ChatPromptTemplate.fromMessages(promptMessages);
      // 创建 runnable
      const chain = prompt.pipe(llm);
      const runnable = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: () => historyMemory,
        inputMessagesKey: 'input',
        historyMessagesKey: 'chat_history'
      }).pipe(new StringOutputParser());

      this.runnableMap.set(agentId, runnable);
      return runnable;
    }
  }
}
