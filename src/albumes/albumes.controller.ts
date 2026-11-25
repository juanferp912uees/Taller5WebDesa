import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Album } from './entities/album.entity.js';
import { AlbumesService } from './albumes.service.js';

@Controller('albumes')
export class AlbumesController {
  constructor(private readonly albumesService: AlbumesService) {}

  @Get()
  findAll(): Promise<Album[]> {
    return this.albumesService.findAll();
  }

  @Get(':id/fotos')
  findFotos(@Param('id', ParseIntPipe) id: number): Promise<Album> {
    return this.albumesService.findFotos(id);
  }
}
