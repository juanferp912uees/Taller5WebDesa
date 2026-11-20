import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { Foto } from './fotos/entities/foto.entity.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const fotosRepo = app.get(DataSource).getRepository(Foto);

  await fotosRepo.clear(); // Vacía la tabla antes de insertar

  for (let i = 1; i <= 10; i++) {
    await fotosRepo.save({
      titulo: `Foto ${i}`,
      descripcion: `Descripción de la foto ${i}`,
      calificacion: Math.round(Math.random() * 50) / 10,
      ruta: `https://picsum.photos/id/${i * 10}/600/400`,
    });
  }

  console.log('✓ 10 fotos insertadas');
  await app.close();
}

bootstrap();
