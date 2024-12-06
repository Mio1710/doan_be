import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config();

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  // synchronize: process.env.NODE_ENV === 'local',
  logging: true,
  migrations: [`${__dirname}/../../db/migrations/*s{.ts,.js}`],
  migrationsTableName: 'migrations',
  autoLoadEntities: true,
}));
