import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: '',
  database: 'nest_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  migrations: [`${__dirname}/../../db/migrations/*s{.ts,.js}`],
  migrationsTableName: 'migrations',
  autoLoadEntities: true,
}));
