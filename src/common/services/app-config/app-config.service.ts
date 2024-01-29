import { EnvironmentEnum } from 'src/common/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  constructor(private readonly configService: ConfigService) {}

  NODE_ENV: string = this.configService.get('NODE_ENV');
  APP_SHORT_NAME: string = this.configService.get('APP_SHORT_NAME');

  MONGODB_URL: string = this.configService.get('MONGODB_URL');

  SUPER_ADMIN_EMAIL: string = this.configService.get('SUPER_ADMIN_EMAIL');
  SUPER_ADMIN_PASS: string = this.configService.get('SUPER_ADMIN_PASS');

  ADMIN_JWT_SECRET: string = this.configService.get('ADMIN_JWT_SECRET');
  ADMIN_JWT_REFRESH_SECRET: string = this.configService.get(
    'ADMIN_JWT_REFRESH_SECRET',
  );
  ADMIN_JWT_EXPIRY: number = this.configService.get('ADMIN_JWT_EXPIRY');
  ADMIN_JWT_REFRESH_EXPIRY: string = this.configService.get(
    'ADMIN_JWT_REFRESH_EXPIRY',
  );
  ADMIN_JWT_PASSWORD_RESET_SECRET: string = this.configService.get(
    'ADMIN_JWT_PASSWORD_RESET_SECRET',
  );
  ADMIN_JWT_PASSWORD_RESET_EXPIRY: string = this.configService.get(
    'ADMIN_JWT_PASSWORD_RESET_EXPIRY',
  );
  ADMIN_FORGET_PASSWORD_URL: string = this.configService.get(
    'ADMIN_FORGET_PASSWORD_URL',
  );

  USER_JWT_SECRET: string = this.configService.get('USER_JWT_SECRET');
  USER_JWT_REFRESH_SECRET: string = this.configService.get(
    'USER_JWT_REFRESH_SECRET',
  );
  USER_JWT_EXPIRY: number = this.configService.get('USER_JWT_EXPIRY');
  USER_JWT_REFRESH_EXPIRY: string = this.configService.get(
    'USER_JWT_REFRESH_EXPIRY',
  );

  SALT_OF_ROUND: number = this.configService.get('SALT_OF_ROUND');

  FIREBASE_PROJECT_ID: string = this.configService.get('FIREBASE_PROJECT_ID');
  FIREBASE_PRIVATE_KEY: string = this.configService.get('FIREBASE_PRIVATE_KEY');
  FIREBASE_CLIENT_EMAIL: string = this.configService.get(
    'FIREBASE_CLIENT_EMAIL',
  );
  FIREBASE_STORAGE_BUCKET: string = this.configService.get(
    'FIREBASE_STORAGE_BUCKET',
  );
  FIREBASE_MESSAGING_API_KEY: string = this.configService.get(
    'FIREBASE_MESSAGING_API_KEY',
  );

  ORDER_RUNTIME_MINS: number = this.configService.get('ORDER_RUNTIME_MINS');

  get UPTIME() {
    return process.uptime();
  }

  static get NODE_ENV() {
    return process.env.NODE_ENV as EnvironmentEnum;
  }
}
