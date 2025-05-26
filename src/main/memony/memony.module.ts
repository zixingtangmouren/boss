import { DatabaseService } from '../database/database.service';
import { MemonyService } from './memony.service';
import { MemonyController } from './memony.controller';
import { MainIpcService } from '../ipc';

export class MemonyModule {
  public memonyService: MemonyService;
  public memonyController: MemonyController;

  constructor(mainIpcService: MainIpcService, databaseService: DatabaseService) {
    this.memonyService = new MemonyService(databaseService);
    this.memonyController = new MemonyController(mainIpcService, this.memonyService);
  }

  async init() {
    this.memonyController.registerEvents();
  }
}
