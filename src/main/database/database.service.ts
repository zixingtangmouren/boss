import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { TableManager } from './table-manager';
import { Entity } from './types';

/**
 * 本地数据库服务
 * 主要负责数据表的创建、删除、获取、列表获取
 */
export class DatabaseService {
  private dbPath: string;
  private tables: Record<string, TableManager<Entity>> = {};

  static checkTableExists(tablePath: string) {
    return fs
      .access(tablePath)
      .then(() => true)
      .catch(() => false);
  }

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'db');
  }

  async init() {
    if (!(await DatabaseService.checkTableExists(this.dbPath))) {
      await fs.mkdir(this.dbPath, { recursive: true });
    }

    console.log('[DatabaseService] init >>>', this.dbPath);
  }

  async createTable(name: string) {
    // 创建表
    const tablePath = path.join(this.dbPath, `${name}.json`);
    if (!(await DatabaseService.checkTableExists(tablePath))) {
      await fs.writeFile(tablePath, '[]');
    }
  }

  async removeTable(name: string) {
    const tablePath = path.join(this.dbPath, `${name}.json`);
    if (!(await DatabaseService.checkTableExists(tablePath))) {
      return;
    }

    if (this.tables[name]) {
      delete this.tables[name];
    }

    await fs.unlink(tablePath);
  }

  async getTable<T extends Entity>(name: string): Promise<TableManager<T>> {
    if (this.tables[name]) {
      return this.tables[name] as TableManager<T>;
    }

    const tablePath = path.join(this.dbPath, `${name}.json`);
    if (
      !(await fs
        .access(tablePath)
        .then(() => true)
        .catch(() => false))
    ) {
      throw new Error('table not exists');
    }

    const tableManager = new TableManager<T>(name);
    this.tables[name] = tableManager;
    await tableManager.init();
    return tableManager;
  }

  async getTableList() {
    const tableList = await fs.readdir(this.dbPath);
    return tableList.map((name) => name.replace('.json', ''));
  }
}
