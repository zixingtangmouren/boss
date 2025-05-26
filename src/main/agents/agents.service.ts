import { DatabaseService } from '../database/database.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { TableManager } from '../database/table-manager';
import { AgentEntity } from './entites/agent.entity';
import { UpdateAgentDto } from './dto/update-agent.dto';

export class AgentsService {
  private databaseService: DatabaseService;
  private table: TableManager<AgentEntity>;
  private agents: AgentEntity[] = [];

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.init();
  }

  async init() {
    await this.databaseService.createTable('agents');
    this.table = await this.databaseService.getTable<AgentEntity>('agents');
  }

  async createAgent(data: CreateAgentDto) {
    const agent = (await this.table.insert(data)) as AgentEntity;
    this.agents.push(agent);
    return agent;
  }

  async deleteAgent(id: string) {
    await this.table.remove({ id });
    this.agents = this.agents.filter((agent) => agent.id !== id);
    return id;
  }

  async updateAgent(where: Partial<AgentEntity>, data: UpdateAgentDto) {
    const agent = (await this.table.update(where, data)) as AgentEntity;
    this.agents = this.agents.map((agent) => (agent.id === agent.id ? agent : agent));
    return agent;
  }

  async getAgents() {
    this.agents = await this.table.findAll();
    return this.agents;
  }

  async getAgent(id: string) {
    return this.agents.find((agent) => agent.id === id);
  }
}
