import { MainIpcService } from '../ipc';
import { DATABASE_EVENT } from './events';
import { DatabaseService } from './database.service';
import { IpcMessage } from '../ipc/types';

export class DatabaseController {
  private mainIpcService: MainIpcService;
  private dbService: DatabaseService;

  constructor(mainIpcService: MainIpcService, dbService: DatabaseService) {
    this.mainIpcService = mainIpcService;
    this.dbService = dbService;
  }

  registerEvents() {
    const { mainIpcService, dbService } = this;

    mainIpcService.addEventListener(DATABASE_EVENT.QUERY, async (event: IpcMessage<unknown>) => {
      try {
        const data = event.data as { table: string; where: any };
        const table = await dbService.getTable(data.table);
        const result = await table.find(data.where || {});
        mainIpcService.postMessage(event.from, DATABASE_EVENT.QUERY, result);
      } catch (err: any) {
        mainIpcService.postMessage(event.from, DATABASE_EVENT.QUERY, { error: err.message });
      }
    });

    mainIpcService.addEventListener(DATABASE_EVENT.INSERT, async (event: IpcMessage<unknown>) => {
      try {
        const data = event.data as { table: string; data: any };
        const table = await dbService.getTable(data.table);
        await table.insert(data.data);
        mainIpcService.postMessage(event.from, DATABASE_EVENT.INSERT, { success: true });
      } catch (err: any) {
        mainIpcService.postMessage(event.from, DATABASE_EVENT.INSERT, { error: err.message });
      }
    });

    mainIpcService.addEventListener(DATABASE_EVENT.UPDATE, async (event: IpcMessage<unknown>) => {
      try {
        const data = event.data as { table: string; where: any; data: any };
        const table = await dbService.getTable(data.table);
        await table.update(data.where, data.data);
        mainIpcService.postMessage(event.from, DATABASE_EVENT.UPDATE, { success: true });
      } catch (err: any) {
        mainIpcService.postMessage(event.from, DATABASE_EVENT.UPDATE, { error: err.message });
      }
    });

    mainIpcService.addEventListener(DATABASE_EVENT.DELETE, async (event: IpcMessage<unknown>) => {
      try {
        const data = event.data as { table: string; where: any };
        const table = await dbService.getTable(data.table);
        await table.remove(data.where);
        mainIpcService.postMessage(event.from, DATABASE_EVENT.DELETE, { success: true });
      } catch (err: any) {
        mainIpcService.postMessage(event.from, DATABASE_EVENT.DELETE, { error: err.message });
      }
    });
  }
}
