import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { SportsArticle } from '../entities/SportsArticle';
import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim());
  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row as CSVRow;
  });
}

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const articleRepository = AppDataSource.getRepository(SportsArticle);
    await articleRepository.clear();
    console.log('🗑️  Cleared existing articles');

    const csvPath = path.join(__dirname, '../../../../sports-articles.csv');
    const rows = parseCSV(csvPath);

    console.log(`📊 Found ${rows.length} rows in CSV`);

    const articles = rows
      .filter((row) => {
        return row.title && row.content && row.title.trim() && row.content.trim();
      })
      .map((row) => {
        let createdAt: Date | null = null;

        if (row.createdAt) {
          const dateParts = row.createdAt.split('-');
          if (dateParts.length === 3) {
            createdAt = new Date(
              parseInt(dateParts[0]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[2])
            );
          }
        }

        const article = articleRepository.create({
          title: row.title.trim(),
          content: row.content.trim(),
          createdAt: createdAt || new Date(),
          imageUrl: row.imageUrl && row.imageUrl.trim() ? row.imageUrl.trim() : undefined,
        });

        return article;
      })
      .filter((article) => article.title && article.content);

    console.log(`✅ Processed ${articles.length} valid articles`);

    const batchSize = 100;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      await articleRepository.save(batch);
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)}`);
    }

    const count = await articleRepository.count();
    console.log(`✨ Seeded ${count} articles successfully!`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
