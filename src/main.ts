import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CitiesService } from './city/city.service';
import { ServicesIconsService } from './services-icons/services-icons.service';
import { AdminService } from './admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/');

  await app.listen(process.env.PORT || 3000);
  const adminService = app.get(AdminService);
  const cityService = app.get(CitiesService);
  const servicesIconsService = app.get(ServicesIconsService);

  await cityService.injectCities();
  await adminService.injectSuperAdmin();
  await servicesIconsService.injectIcons();
}
bootstrap();
