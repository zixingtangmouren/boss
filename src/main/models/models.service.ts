import { DatabaseService } from '../database/database.service';
import { ModelEntity } from './entites/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { TableManager } from '../database/table-manager';
import { DeleteModelDto } from './dto/delete-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

export class ModelsService {
  private databaseService: DatabaseService;
  private table: TableManager<ModelEntity>;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.init();
  }

  async init() {
    await this.databaseService.createTable('models');
    this.table = await this.databaseService.getTable<ModelEntity>('models');
  }

  async createModel(data: CreateModelDto) {
    return await this.table.insert(data);
  }

  async getModels() {
    return await this.table.findAll();
  }

  async deleteModel(data: DeleteModelDto) {
    return await this.table.remove(data);
  }

  async updateModel(where: Partial<ModelEntity>, data: UpdateModelDto) {
    return await this.table.update(where, data);
  }
}
