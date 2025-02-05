# How to start the application
- clone the repo
- run pnpm install
- replace your postgres db url in db package inside the .env file
- npx prisma migrate dev --name <migration-name> 
- run pnpm run dev
