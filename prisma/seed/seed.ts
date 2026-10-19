import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon from 'argon2';
import { PrismaClient } from '../../src/generated/prisma/client';

/** Shared password for all seeded accounts — development only. */
const SEED_PASSWORD = 'Password123!';

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Refusing to seed: this script wipes data (NODE_ENV=production).',
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seed() {
  console.log('Seeding database...');

  // Users cascade-delete their bookmarks.
  await prisma.user.deleteMany();

  const hash = await argon.hash(SEED_PASSWORD);

  await prisma.user.create({
    data: {
      email: 'alex@example.com',
      hash,
      firstName: 'Alex',
      lastName: 'Anderson',
      bookmarks: {
        create: [
          {
            title: 'NestJS Documentation',
            description: 'A progressive Node.js framework',
            link: 'https://docs.nestjs.com',
          },
          {
            title: 'Prisma Documentation',
            description: 'Next-generation ORM for Node.js and TypeScript',
            link: 'https://www.prisma.io/docs',
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      hash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      bookmarks: {
        create: [
          {
            title: 'Stack Overflow',
            description: 'For when I get stuck',
            link: 'https://stackoverflow.com',
          },
        ],
      },
    },
  });

  console.log(`Seeded 2 users (password: ${SEED_PASSWORD}).`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
