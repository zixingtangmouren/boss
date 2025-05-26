import { MainIpcService } from '../ipc/main-ipc-service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AgentsService } from '../agents/agents.service';
import { ModelsService } from '../models/models.service';
import { MemonyService } from '../memony/memony.service';

export class ChatModule {
  private chatService: ChatService;
  private chatController: ChatController;
  private;

  constructor(
    mainIpcService: MainIpcService,
    agentsService: AgentsService,
    modelsService: ModelsService,
    memonyService: MemonyService
  ) {
    this.chatService = new ChatService(agentsService, modelsService, memonyService);
    this.chatController = new ChatController(mainIpcService, this.chatService, memonyService);
  }

  init() {
    this.chatController.registerEvents();
  }
}
