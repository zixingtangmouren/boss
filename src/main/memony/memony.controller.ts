import { MainIpcService } from '../ipc';
import { MemonyService } from './memony.service';
import { MEMORY_EVENT } from './events';
import { AddMessageDto } from './dto/add-message.dto';

export class MemonyController {
  private mainIpcService: MainIpcService;
  public memonyService: MemonyService;

  constructor(mainIpcService: MainIpcService, memonyService: MemonyService) {
    this.mainIpcService = mainIpcService;
    this.memonyService = memonyService;
  }

  registerEvents() {
    const { mainIpcService } = this;
    mainIpcService.addEventListener(MEMORY_EVENT.GET_MEMORY_LIST, async (event) => {
      const { agentId } = event.data as { agentId: string };
      const memoryList = await this.memonyService.getMemoryList(agentId);
      mainIpcService.postMessage(event.from, MEMORY_EVENT.GET_MEMORY_LIST, memoryList);
    });

    mainIpcService.addEventListener(MEMORY_EVENT.ADD_MESSAGE, async (event) => {
      const { agentId, content, role } = event.data as AddMessageDto;
      await this.memonyService.addMessage(agentId, content, role);
      mainIpcService.postMessage(event.from, MEMORY_EVENT.ADD_MESSAGE, {
        success: true,
        message: 'success'
      });
    });
  }
}
