import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SportsArticle } from './entities/SportsArticle';

let envPath: string;
try {
  envPath = join(__dirname, '../.env');
} catch {
  envPath = join(process.cwd(), '.env');
}
config({ path: envPath });

function parseDatabaseUrl(url: string | undefined) {
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const parsedUrl = new URL(url);
    const password = decodeURIComponent(parsedUrl.password);
    
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 5432,
      username: decodeURIComponent(parsedUrl.username),
      password: password,
      database: parsedUrl.pathname.slice(1).split('?')[0],
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [SportsArticle],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/migrations/**/*.js'
      : 'src/migrations/**/*.ts',
  ],
  migrationsTableName: 'migrations',
});
