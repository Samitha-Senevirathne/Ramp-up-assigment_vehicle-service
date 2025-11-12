import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { multerConfig } from '../config/multer.config';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', multerConfig))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   //push the file.path to ImportService to queue the job.
  //   return this.importService.addFileToQueue(file.path);
  // }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return { statusCode: 400, message: 'No file uploaded' };
      }
      return await this.importService.addFileToQueue(file.path);
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message || 'Internal Server Error',
      };
    }
  }
}
