import { MainIpcService } from '../ipc/main-ipc-service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AgentsService } from '../agents/agents.service';
import { ModelsService } from '../models/models.service';

export class ChatModule {
  private chatService: ChatService;
  private chatController: ChatController;

  constructor(
    mainIpcService: MainIpcService,
    agentsService: AgentsService,
    modelsService: ModelsService
  ) {
    this.chatService = new ChatService(agentsService, modelsService);
    this.chatController = new ChatController(mainIpcService, this.chatService);
  }

  init() {
    this.chatController.registerEvents();
  }
}
