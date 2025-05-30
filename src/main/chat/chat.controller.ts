import { MainIpcService } from '../ipc/main-ipc-service';
import { MemonyService } from '../memony/memony.service';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { CHAT_EVENT } from './events';

export class ChatController {
  private mainIpcService: MainIpcService;
  private chatService: ChatService;
  private memonyService: MemonyService;

  constructor(
    mainIpcService: MainIpcService,
    chatService: ChatService,
    memonyService: MemonyService
  ) {
    this.mainIpcService = mainIpcService;
    this.chatService = chatService;
    this.memonyService = memonyService;
  }

  registerEvents() {
    const { mainIpcService } = this;
    mainIpcService.addEventListener(CHAT_EVENT.START_SEND_MESSAGE, async (event) => {
      console.log('start send message >>>', event);
      const data = event.data as ChatDto;
      await this.memonyService.addMessage(data.agentId, data.query, 'user');
      try {
        const stream = await this.chatService.chat(data);
        const reader = stream.getReader();
        let message = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            mainIpcService.postMessage(event.from, CHAT_EVENT.STOP_SEND_MESSAGE, {
              success: true,
              message: 'success'
            });
            break;
          }
          message += value;
          mainIpcService.postMessage(event.from, CHAT_EVENT.SENDING_MESSAGE, {
            data: value
          });
        }
        this.memonyService.addMessage(data.agentId, message, 'agent');
      } catch (error) {
        console.error('error >>>', error);
        mainIpcService.postMessage(event.from, CHAT_EVENT.STOP_SEND_MESSAGE, {
          success: false,
          message: error
        });
      }
    });
  }
}
