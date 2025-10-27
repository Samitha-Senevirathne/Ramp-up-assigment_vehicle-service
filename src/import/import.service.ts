import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';


@Injectable()
export class ImportService {

    constructor(@InjectQueue('importQueue')private importQueue:Queue) {}


    async addFileToQueue(filePath:string){
        //Adds a new job called processImport into Redis with the file path.
        await this.importQueue.add('processImport',{filePath});
        return {message:'file queued for import'};
    }
}
