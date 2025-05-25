import { DatabaseController } from './database.controller';
import { DbService } from './database.service';

export class DatabaseModule {
  private databaseController: DatabaseController;
  private dbService: DbService;

  constructor(mainIpcService: any) {
    this.dbService = new DbService();
    this.databaseController = new DatabaseController(mainIpcService, this.dbService);
  }

  async init() {
    await this.dbService.init();
    this.databaseController.registerEvents();
  }
}
