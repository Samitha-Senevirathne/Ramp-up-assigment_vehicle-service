
import { Controller, Post, Body } from '@nestjs/common';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('vehicles')
  async exportVehicles(@Body('minAge') minAge?: number) {
    return this.exportService.queueExport(minAge);
  }
}
