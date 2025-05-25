import { MainIpcService } from '../ipc';
import { STORE_EVENT } from './events';
import { StoreService } from './store.service';
export class StoreController {
  private mainIpcService: MainIpcService;
  private storeService: StoreService;

  constructor(mainIpcService: MainIpcService, storeService: StoreService) {
    this.mainIpcService = mainIpcService;
    this.storeService = storeService;
  }

  registerEvents() {
    const { mainIpcService } = this;

    mainIpcService.addEventListener(STORE_EVENT.GET_STORE, (event) => {
      const { storeName } = event.data as { storeName: string };
      const store = mainIpcService.getStore(storeName);
      mainIpcService.postMessage(event.from, STORE_EVENT.GET_STORE, store);
    });
  }
}
