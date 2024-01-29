import * as Joi from 'joi';

export const configSchema = () => {
  return Joi.object({
    NODE_ENV: Joi.string().required(),
    APP_SHORT_NAME: Joi.string().required(),
    MONGODB_URL: Joi.string().required(),

    USER_JWT_SECRET: Joi.string().required(),
    USER_JWT_REFRESH_SECRET: Joi.string().required(),
    USER_JWT_EXPIRY: Joi.number().required(),
    USER_JWT_REFRESH_EXPIRY: Joi.string().required(),

    ADMIN_JWT_SECRET: Joi.string().required(),
    ADMIN_JWT_REFRESH_SECRET: Joi.string().required(),
    ADMIN_JWT_EXPIRY: Joi.string().required(),
    ADMIN_JWT_REFRESH_EXPIRY: Joi.string().required(),
    ADMIN_JWT_PASSWORD_RESET_SECRET: Joi.string().required(),
    ADMIN_JWT_PASSWORD_RESET_EXPIRY: Joi.string().required(),
    ADMIN_FORGET_PASSWORD_URL: Joi.string().required(),

    SUPER_ADMIN_EMAIL: Joi.string().required(),
    SUPER_ADMIN_PASS: Joi.string().required(),

    FIREBASE_PROJECT_ID: Joi.string().required(),
    FIREBASE_PRIVATE_KEY: Joi.string().required(),
    FIREBASE_CLIENT_EMAIL: Joi.string().required(),

    FIREBASE_STORAGE_BUCKET: Joi.string().required(),
    FIREBASE_MESSAGING_API_KEY: Joi.string().required(),

    ORDER_RUNTIME_MINS: Joi.number().required(),
  });
};
