import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const rawPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    console.log('🌱 開始執行 Seed 資料初始化...');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@darong.com' },
        update: {
            password: hashedPassword,
            role: 'DEV',
        },
        create: {
            email: 'admin@darong.com',
            name: '系統管理員',
            password: hashedPassword,
            role: 'DEV',
        },
    });

    console.log('-----------------------------------------');
    console.log('測試帳號建立成功！');
    console.log(`帳號: ${admin.email}`);
    console.log(`密碼: ${rawPassword}`);
    console.log(`權限: ${admin.role}`);
    console.log('-----------------------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Seed 執行失敗:', e);
        process.exit(1);
    })
    .finally(async () => {
        // 關閉資料庫連線
        await prisma.$disconnect();
    });
