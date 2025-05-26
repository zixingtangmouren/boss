import { MainIpcService } from '../ipc';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { DatabaseService } from '../database/database.service';

export class AgentsModule {
  public agentsService: AgentsService;
  private agentsController: AgentsController;

  constructor(mainIpcService: MainIpcService, databaseService: DatabaseService) {
    this.agentsService = new AgentsService(databaseService);
    this.agentsController = new AgentsController(mainIpcService, this.agentsService);
  }

  init() {
    this.agentsController.registerEvents();
  }
}
