import { Entity } from '../../database/types';

export class ModelEntity extends Entity {
  modelName: string;
  baseUrl: string;
  apiKey: string;
}
