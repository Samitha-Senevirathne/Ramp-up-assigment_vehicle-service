import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';


@Injectable()
export class ImportService {

    constructor(@InjectQueue('importQueue')private importQueue:Queue) {}

    async addFileToQueue(filePath: string) {
  try {
    await this.importQueue.add('processImport', { filePath });  //Adds a new job called processImport into Redis with the file path
    return { message: 'file queuedd  for import' };
  } catch (error) {
    console.error('Error happend queueing import job:', error);
    throw new Error('Failed to queue import job');
  }
}

}
