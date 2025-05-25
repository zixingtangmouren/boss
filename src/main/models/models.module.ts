import { MainIpcService } from '../ipc';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { DatabaseService } from '../database/database.service';

export class ModelsModule {
  private mainIpcService: MainIpcService;
  private modelsService: ModelsService;
  private modelsController: ModelsController;

  constructor(mainIpcService: MainIpcService, databaseService: DatabaseService) {
    this.mainIpcService = mainIpcService;
    this.modelsService = new ModelsService(databaseService);
    this.modelsController = new ModelsController(mainIpcService, this.modelsService);
  }

  init() {
    this.modelsController.registerEvents();
  }
}
