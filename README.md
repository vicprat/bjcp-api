# Node.js Application with TypeScript and Prisma

This is a Node.js application using TypeScript and Prisma for database management. The application consists of three main scripts located in the `src` directory: `counter.ts`, `prepareData.ts`, and `seed.ts`.

## Prerequisites

- Node.js
- npm or yarn
- TypeScript
- Prisma

## Install dependencies

npm install

## Create a .env file

Create a .env file in the root directory of the project and add the following line, replacing <your-database-url> with your actual database URL:
DATABASE_URL=<your-database-url>

## Prisma

Prisma is used for database management and migrations. To create and apply migrations, use the following command:

npx prisma migrate dev --name <migration-name>
Replace <migration-name> with a descriptive name for your migration.

Running the Scripts
To execute the scripts, use the following commands:

Run counter.ts

npx ts-node src/counter.ts
Run prepareData.ts

npx ts-node src/prepareData.ts
Run seed.ts

npx ts-node src/seed.ts
