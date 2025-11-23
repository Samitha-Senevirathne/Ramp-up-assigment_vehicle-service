import { Controller, Post, Body, Param, Res, Get } from '@nestjs/common';
import { ExportService } from './export.service';
import type{ Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('vehicles')
   async exportVehicles(@Body('minAge') minAge?: number, @Body('userId') userId?: string){
    try{
            return this.exportService.queueExport(minAge, userId);

    }catch(error){

            return { statusCode: 500, message: error.message || 'Internal Server Error' };

    }
   }



@Get('download/:filename')
async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
  const filePath = join(process.cwd(), 'exports', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  try {
    res.download(filePath, filename, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
          else console.log('Deleted file:', filename);
        });
      }
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Internal Server Error');
  }
}
}

