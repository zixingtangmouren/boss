import { DatabaseService } from '../database/database.service';
import { ModelEntity } from './entites/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { TableManager } from '../database/table-manager';
import { DeleteModelDto } from './dto/delete-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ChatOpenAI } from '@langchain/openai';
import { Ollama } from '@langchain/community/llms/ollama';

export class ModelsService {
  private databaseService: DatabaseService;
  private table: TableManager<ModelEntity>;
  private models: ModelEntity[] = [];
  private modelInstances: Map<string, ChatOpenAI | Ollama> = new Map();

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
    const models = await this.table.findAll();
    this.models = models;
    return models;
  }

  async deleteModel(data: DeleteModelDto) {
    return await this.table.remove(data);
  }

  async updateModel(where: Partial<ModelEntity>, data: UpdateModelDto) {
    return await this.table.update(where, data);
  }

  async createModelInstance(modelId: string) {
    if (this.modelInstances.has(modelId)) {
      return this.modelInstances.get(modelId);
    }

    const model = this.models.find((model) => model.id === modelId);
    if (!model) {
      throw new Error('Model not found');
    }
    console.log('create model instance >>>', {
      model: model.modelName,
      configuration: {
        apiKey: model.apiKey,
        baseURL: model.baseUrl
      }
    });
    let modelInstance: ChatOpenAI | Ollama;
    if (model.modelName.toLocaleLowerCase().includes('llama')) {
      console.log('create ollama model instance >>>');
      modelInstance = new Ollama({
        model: model.modelName,
        baseUrl: model.baseUrl
      });
    } else {
      console.log('create chatopenai model instance >>>');
      modelInstance = new ChatOpenAI({
        model: model.modelName,
        configuration: {
          apiKey: model.apiKey,
          baseURL: model.baseUrl
        }
      });
    }
    this.modelInstances.set(modelId, modelInstance);
    return modelInstance;
  }
}
