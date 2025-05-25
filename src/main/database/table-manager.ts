import fs from 'fs/promises';
import { Entity } from './types';
import { v4 as uuid } from 'uuid';
export class TableManager<T extends Entity> {
  private jsonPath: string;
  private tableData: T[] = [];

  constructor(jsonPath: string) {
    this.jsonPath = jsonPath;
    this.init();
  }

  async init() {
    try {
      const json = await fs.readFile(this.jsonPath, 'utf-8');
      this.tableData = JSON.parse(json);
    } catch {
      this.tableData = [];
    }
  }

  async insert(
    data: Partial<Pick<T, 'id' | 'createdAt' | 'updatedAt'>> &
      Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const newData = {
      ...data,
      id: data.id || uuid(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    } as T;

    const newTableData = [...this.tableData, newData];

    try {
      await fs.writeFile(this.jsonPath, JSON.stringify(newTableData));
      this.tableData = newTableData;
    } catch (error) {
      console.error('insert error >>>', error);
    }
  }

  async remove(where: Partial<T>, callback?: (item: T) => void) {
    const whereKeys = Object.keys(where);
    const newTableData = this.tableData.filter((item) => {
      return whereKeys.every((key) => item[key] === where[key]);
    });

    try {
      await fs.writeFile(this.jsonPath, JSON.stringify(newTableData));
      this.tableData = newTableData;
    } catch (error) {
      console.error('remove error >>>', error);
    } finally {
      if (callback) {
        this.tableData.forEach((item) => {
          callback(item);
        });
      }
    }
  }

  async update(where: Partial<T>, data: Partial<T>, callback?: (item: T) => void) {
    const whereKeys = Object.keys(where);
    const newTableData = this.tableData.map((item) => {
      return whereKeys.every((key) => item[key] === where[key]) ? { ...item, ...data } : item;
    });

    try {
      await fs.writeFile(this.jsonPath, JSON.stringify(newTableData));
      this.tableData = newTableData;
    } catch (error) {
      console.error('update error >>>', error);
    } finally {
      if (callback) {
        this.tableData.forEach((item) => {
          callback(item);
        });
      }
    }
  }

  async find(where: Partial<T>) {
    const whereKeys = Object.keys(where);
    return this.tableData.filter((item) => {
      return whereKeys.every((key) => item[key] === where[key]);
    });
  }
}
