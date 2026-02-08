@echo off

call npx prisma generate
call npx prisma db push --force-reset
echo Seeding database...
call npx ts-node prisma/seed.ts
