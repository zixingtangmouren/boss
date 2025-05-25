import { MainIpcService } from '../ipc';
import { DatabaseService } from '../database/database.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { TableManager } from '../database/table-manager';
import { AgentEntity } from './entites/agent.entity';
import { UpdateAgentDto } from './dto/update-agent.dto';

export class AgentsService {
  private mainIpcService: MainIpcService;
  private databaseService: DatabaseService;
  private table: TableManager<AgentEntity>;
  constructor(mainIpcService: MainIpcService, databaseService: DatabaseService) {
    this.mainIpcService = mainIpcService;
    this.databaseService = databaseService;
    this.init();
  }

  async init() {
    await this.databaseService.createTable('agents');
    this.table = await this.databaseService.getTable<AgentEntity>('agents');
  }

  async createAgent(data: CreateAgentDto) {
    return await this.table.insert(data);
  }

  async deleteAgent(id: string) {
    return await this.table.remove({ id });
  }

  async updateAgent(where: Partial<AgentEntity>, data: UpdateAgentDto) {
    return await this.table.update(where, data);
  }

  async getAgents() {
    return await this.table.findAll();
  }
}
