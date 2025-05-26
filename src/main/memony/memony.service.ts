import { DatabaseService } from '../database/database.service';
import { TableManager } from '../database/table-manager';
import { MemoryEntity } from './entities/memony.entity';

export class MemonyService {
  private databaseService: DatabaseService;
  private table: TableManager<MemoryEntity>;
  private memoryMap: Map<string, MemoryEntity[]> = new Map();

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.init();
  }

  async init() {
    await this.databaseService.createTable('memories');
    this.table = await this.databaseService.getTable<MemoryEntity>('memories');
  }

  async getMemoryList(agentId: string) {
    const memoryList = await this.table.find({ agentId });
    this.memoryMap.set(agentId, memoryList);
    return memoryList || [];
  }

  async addMessage(agentId: string, content: string, role: 'user' | 'agent') {
    const memory = await this.table.insert({ agentId, content, role });
    if (memory) {
      this.memoryMap.set(agentId, [...(this.memoryMap.get(agentId) || []), memory]);
    }
    return memory;
  }

  // TODO: 暂时给chatService使用，后续需要优化
  getMemoryListByAgentId(agentId: string) {
    if (this.memoryMap.has(agentId)) {
      return this.memoryMap.get(agentId) || [];
    }
    return [];
  }
}
