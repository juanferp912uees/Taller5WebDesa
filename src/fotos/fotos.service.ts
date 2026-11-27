import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';
import type { CreateFotoDto } from './dto/create-foto.dto.js';
import type { QueryFotosDto } from './dto/query-fotos.dto.js';
import type { UpdateFotoDto } from './dto/update-foto.dto.js';
import { Etiqueta } from './entities/etiqueta.entity.js';
import { Foto } from './entities/foto.entity.js';

export interface FiltroFotos {
  min: number;
  max: number;
  q?: string;
  etiqueta?: string;
  orden?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginaFotos {
  data: Foto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepo: Repository<Foto>,
    @InjectRepository(Etiqueta)
    private readonly etiquetasRepo: Repository<Etiqueta>,
  ) {}

  async findAll({
    min,
    max,
    q,
    etiqueta,
    orden = 'asc',
    page,
    limit,
  }: QueryFotosDto): Promise<PaginaFotos> {
    const [data, total] = await this.fotosRepo.findAndCount({
      where: {
        calificacion: Between(min, max),
        ...(q?.trim() ? { titulo: ILike(`%${q.trim()}%`) } : {}),
        ...(etiqueta?.trim()
          ? { etiquetas: { texto: etiqueta.trim() } }
          : {}),
      },
      relations: { album: true, etiquetas: true },
      order: { calificacion: orden === 'desc' ? 'DESC' : 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotosRepo.findOne({
      where: { id },
      relations: { album: true, etiquetas: true },
    });

    if (!foto) {
      throw new NotFoundException(`Foto ${id} no encontrada`);
    }

    return foto;
  }

  async create({ albumId, etiquetas, ...datos }: CreateFotoDto): Promise<Foto> {
    const foto = this.fotosRepo.create({
      ...datos,
      album: albumId ? { id: albumId } : null,
      etiquetas: await this.buscarOCrearEtiquetas(etiquetas),
    });
    const guardada = await this.fotosRepo.save(foto);
    return this.findOne(guardada.id);
  }

  async update(
    id: number,
    { albumId, etiquetas, ...datos }: UpdateFotoDto,
  ): Promise<Foto> {
    const foto = await this.findOne(id);
    Object.assign(foto, datos);
    if (albumId !== undefined) foto.album = { id: albumId } as Foto['album'];
    if (etiquetas) foto.etiquetas = await this.buscarOCrearEtiquetas(etiquetas);
    await this.fotosRepo.save(foto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const foto = await this.findOne(id);
    await this.fotosRepo.remove(foto);
  }

  private async buscarOCrearEtiquetas(textos: string[] = []) {
    const limpios = [...new Set(textos.map((texto) => texto.trim().toLowerCase()))];
    const existentes = await this.etiquetasRepo.findBy({ texto: In(limpios) });
    const nuevas = limpios
      .filter((texto) => !existentes.some((etiqueta) => etiqueta.texto === texto))
      .map((texto) => this.etiquetasRepo.create({ texto }));
    return [...existentes, ...(await this.etiquetasRepo.save(nuevas))];
  }
}
