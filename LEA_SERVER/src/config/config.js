import { config } from 'dotenv';
config();

const configuraciones = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_CREDENTIALS_USER: process.env.DB_CREDENTIALS_USER,
    DB_CREDENTIALS_PASSWORD: process.env.DB_CREDENTIALS_PASSWORD,
    DB_NAME: process.env.DB_NAME, 
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
}

export default configuraciones