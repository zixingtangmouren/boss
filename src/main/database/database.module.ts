import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

export class DatabaseModule {
  private databaseController: DatabaseController;
  public databaseService: DatabaseService;

  constructor(mainIpcService: any) {
    this.databaseService = new DatabaseService();
    this.databaseController = new DatabaseController(mainIpcService, this.databaseService);
  }

  async init() {
    this.databaseController.registerEvents();
  }
}
