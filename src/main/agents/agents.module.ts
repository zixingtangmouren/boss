import { MainIpcService } from '../ipc';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { DatabaseService } from '../database/database.service';

export class AgentsModule {
  private mainIpcService: MainIpcService;
  private agentsService: AgentsService;
  private agentsController: AgentsController;

  constructor(mainIpcService: MainIpcService, databaseService: DatabaseService) {
    this.mainIpcService = mainIpcService;
    this.agentsService = new AgentsService(mainIpcService, databaseService);
    this.agentsController = new AgentsController(mainIpcService, this.agentsService);
  }

  init() {
    this.agentsController.registerEvents();
  }
}
