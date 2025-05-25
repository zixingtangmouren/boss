import { MainIpcService } from '../ipc';
import { AgentsService } from './agents.service';
import { AGENTS_EVENT } from './events';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

export class AgentsController {
  private mainIpcService: MainIpcService;
  private agentsService: AgentsService;

  constructor(mainIpcService: MainIpcService, agentsService: AgentsService) {
    this.mainIpcService = mainIpcService;
    this.agentsService = agentsService;
  }

  registerEvents() {
    const { mainIpcService } = this;

    mainIpcService.addEventListener(AGENTS_EVENT.CREATE_AGENT, async (event) => {
      const data = event.data as CreateAgentDto;
      await this.agentsService.createAgent(data);
      mainIpcService.postMessage(event.from, AGENTS_EVENT.CREATE_AGENT, data);
    });

    mainIpcService.addEventListener(AGENTS_EVENT.DELETE_AGENT, async (event) => {
      const data = event.data as string;
      await this.agentsService.deleteAgent(data);
      mainIpcService.postMessage(event.from, AGENTS_EVENT.DELETE_AGENT, data);
    });

    mainIpcService.addEventListener(AGENTS_EVENT.UPDATE_AGENT, async (event) => {
      const data = event.data as UpdateAgentDto;
      await this.agentsService.updateAgent({ id: data.id }, data);
      mainIpcService.postMessage(event.from, AGENTS_EVENT.UPDATE_AGENT, data);
    });

    mainIpcService.addEventListener(AGENTS_EVENT.GET_AGENTS, async (event) => {
      const data = await this.agentsService.getAgents();
      mainIpcService.postMessage(event.from, AGENTS_EVENT.GET_AGENTS, data);
    });
  }
}
