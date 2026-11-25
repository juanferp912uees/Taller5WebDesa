import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Foto } from './entities/foto.entity.js';
import { FotosService } from './fotos.service.js';
import type { FiltroFotos, PaginaFotos } from './fotos.service.js';

@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Get()
  findAll(
    @Query('min', new DefaultValuePipe(0), ParseFloatPipe) min: number,
    @Query('max', new DefaultValuePipe(5), ParseFloatPipe) max: number,
    @Query('q') q: string | undefined,
    @Query('etiqueta') etiqueta: string | undefined,
    @Query('orden') orden: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginaFotos> {
    const filtros: FiltroFotos = {
      min,
      max,
      q,
      etiqueta,
      orden: orden?.toLowerCase() === 'desc' ? 'desc' : 'asc',
      page,
      limit,
    };
    return this.fotosService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Foto> {
    return this.fotosService.findOne(id);
  }

  @Post()
  create(@Body() datos: Partial<Foto>): Promise<Foto> {
    return this.fotosService.create(datos);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<Foto>,
  ): Promise<Foto> {
    return this.fotosService.update(id, datos);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.fotosService.remove(id);
  }
}
