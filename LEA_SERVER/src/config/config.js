import {config} from 'dotenv';
config();

const configuraciones = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_CREDENTIALS_USER: process.env.DB_CREDENTIALS_USER,
    DB_CREDENTIALS_PASSWORD: process.env.DB_CREDENTIALS_PASSWORD,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
}

export default configuraciones