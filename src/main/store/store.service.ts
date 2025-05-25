import { MainIpcService } from '../ipc';

export class StoreService {
  private mainIpcService: MainIpcService;

  constructor(mainIpcService: MainIpcService) {
    this.mainIpcService = mainIpcService;
  }
}
