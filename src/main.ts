import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CitiesService } from './city/city.service';
import { ServicesIconsService } from './services-icons/services-icons.service';
import { AdminService } from './admin/admin.service';
import { SwaggerModuleConfig } from './common/interfaces';
import { AppConfig } from './common/services/app-config';
import { ValidationError } from 'class-validator';
import { CustomError } from './common/classes';
import { ErrorType } from './common/enums';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseValidationErrors } from './common/helpers';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      persona?: any;
    }
  }
}
async function bootstrap(swaggerConfig: SwaggerModuleConfig) {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfig);

  const appShortName = appConfig.APP_SHORT_NAME;

  app.setGlobalPrefix(appShortName);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          new CustomError({
            localizedMessage: {
              en: 'Validation failed',
              ar: 'فشل التحقق من الصحة',
            },
            errorType: ErrorType.WRONG_INPUT,
            event: 'VALIDATION_FAILED',
            error: parseValidationErrors(validationErrors),
          }),
        );
      },
    }),
  );

  app.enableVersioning();

  app.enableCors({
    origin: true,
    methods: '*',
    allowedHeaders: '*',
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api/');

  const {
    title = appConfig.APP_SHORT_NAME,
    version,
    description,
  } = swaggerConfig.config;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description ?? '')
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${appShortName}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const adminService = app.get(AdminService);
  const cityService = app.get(CitiesService);
  const servicesIconsService = app.get(ServicesIconsService);

  await cityService.injectCities();
  await adminService.injectSuperAdmin();
  await servicesIconsService.injectIcons();

  await app.listen(3000);
}

bootstrap({ enabled: true, config: { version: '1.0.0' } });
