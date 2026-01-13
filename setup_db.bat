@echo off
set "DATABASE_URL=postgresql://neondb_owner:npg_5ouXQvtyf3YO@ep-rough-union-a4ay6rtw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
call npx prisma generate
call npx prisma db push --force-reset
echo Seeding database...
call npx ts-node prisma/seed.ts
