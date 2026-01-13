import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5ouXQvtyf3YO@ep-rough-union-a4ay6rtw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
