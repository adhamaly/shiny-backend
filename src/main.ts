import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CitiesService } from './city/city.service';
import { AdminRepository } from './admin/admin.repository';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/');

  await app.listen(process.env.PORT || 3000);
  const adminRepository = app.get(AdminRepository);
  const cityService = app.get(CitiesService);
  await cityService.injectCities();
  await adminRepository.injectSuperAdmin();
}
bootstrap();
