import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { RenderIpcService } from '../main/ipc/render-ipc-service';
import { WINDOWS_SERVICE_EVENT } from '../main/windows/events';
import { DATABASE_EVENT } from '../main/database/events';
import { MODELS_EVENT } from '../main/models/events';
import { CreateModelDto } from '../main/models/dto/create-model.dto';
import { CreateAgentDto } from '../main/agents/dto/create-agent.dto';
import { AGENTS_EVENT } from '../main/agents/events';
import { UpdateAgentDto } from '../main/agents/dto/update-agent.dto';

interface InvokeOptions {
  eventName: string;
  data?: unknown;
  options?: {
    processKey?: string;
    result: boolean;
  };
}

const invoke = ({
  eventName,
  data,
  options = { processKey: 'main', result: false }
}: InvokeOptions) => {
  return new Promise((resolve) => {
    if (options.result) {
      renderIpcService.addEventListener(eventName, (event) => {
        resolve(event);
      });
    } else {
      resolve(null);
    }
    renderIpcService.postMessage(options.processKey || 'main', eventName, data);
  });
};

const args = process.argv.slice(2);

console.log('args >>>', args);

const processKey =
  args.find((arg) => arg.startsWith('--processKey='))?.split('=')[1] || 'render-default';

const windowService = {
  openWindow: (name: string) => {
    invoke({
      eventName: WINDOWS_SERVICE_EVENT.OPEN_WINDOW,
      data: {
        name
      }
    });
  },
  closeWindow: (name: string) => {
    invoke({
      eventName: WINDOWS_SERVICE_EVENT.CLOSE_WINDOW,
      data: {
        name
      }
    });
  },
  getAllWindows: () => {
    return invoke({
      eventName: WINDOWS_SERVICE_EVENT.GET_ALL_WINDOWS,
      options: {
        processKey: 'main',
        result: true
      }
    });
  }
};

const ipcService = {
  postMessage: (processKey: string, eventName: string, data?: unknown) => {
    renderIpcService.postMessage(processKey, eventName, data);
  },
  postMessageToAll: (eventName: string, data?: unknown) => {
    renderIpcService.postMessageToAll(eventName, data);
  },
  getAllProcessKeys: () => {
    return renderIpcService.getAllProcessKeys();
  }
};

const dbService = {
  query: (table: string, where: unknown) => {
    return invoke({
      eventName: DATABASE_EVENT.QUERY,
      data: {
        table,
        where
      },
      options: {
        result: true
      }
    });
  }
};

const modelsService = {
  createModel: (data: CreateModelDto) => {
    return invoke({
      eventName: MODELS_EVENT.CREATE_MODEL,
      data
    });
  }
};

const agentsService = {
  createAgent: (data: CreateAgentDto) => {
    return invoke({
      eventName: AGENTS_EVENT.CREATE_AGENT,
      data
    });
  },
  deleteAgent: (id: string) => {
    return invoke({
      eventName: AGENTS_EVENT.DELETE_AGENT,
      data: id
    });
  },
  updateAgent: (data: UpdateAgentDto) => {
    return invoke({
      eventName: AGENTS_EVENT.UPDATE_AGENT,
      data
    });
  },
  getAgents: () => {
    return invoke({
      eventName: AGENTS_EVENT.GET_AGENTS,
      options: {
        result: true
      }
    });
  }
};

// Custom APIs for renderer
const api = {
  windowService,
  ipcService,
  dbService,
  modelsService,
  agentsService
};

export type Api = typeof api;

const renderIpcService = new RenderIpcService(processKey);

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
