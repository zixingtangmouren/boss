import { MainIpcService } from '../ipc';
import { MODELS_EVENT } from './events';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { DeleteModelDto } from './dto/delete-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

export class ModelsController {
  private mainIpcService: MainIpcService;
  private modelsService: ModelsService;

  constructor(mainIpcService: MainIpcService, modelsService: ModelsService) {
    this.mainIpcService = mainIpcService;
    this.modelsService = modelsService;
  }

  registerEvents() {
    const { mainIpcService } = this;

    mainIpcService.addEventListener(MODELS_EVENT.CREATE_MODEL, async (event) => {
      const data = event.data as CreateModelDto;
      const result = await this.modelsService.createModel(data);
      mainIpcService.postMessage(event.from, MODELS_EVENT.CREATE_MODEL, {
        success: !!result,
        data: result
      });
    });

    mainIpcService.addEventListener(MODELS_EVENT.GET_MODELS, async (event) => {
      const result = await this.modelsService.getModels();
      mainIpcService.postMessage(event.from, MODELS_EVENT.GET_MODELS, {
        success: !!result,
        data: result
      });
    });

    mainIpcService.addEventListener(MODELS_EVENT.DELETE_MODEL, async (event) => {
      const data = event.data as DeleteModelDto;
      const result = await this.modelsService.deleteModel(data);
      mainIpcService.postMessage(event.from, MODELS_EVENT.DELETE_MODEL, {
        success: !!result,
        data: result
      });
    });

    mainIpcService.addEventListener(MODELS_EVENT.UPDATE_MODEL, async (event) => {
      const { id, ...data } = event.data as UpdateModelDto;
      const result = await this.modelsService.updateModel({ id }, data);
      mainIpcService.postMessage(event.from, MODELS_EVENT.UPDATE_MODEL, {
        success: !!result,
        data: result
      });
    });
  }
}
