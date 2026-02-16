// Script to move uploaded files and update database paths
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../frontend/node_modules/.prisma/client');

const prisma = new PrismaClient();

async function migrateFiles() {
    console.log('🔄 Starting file migration...');

    // Define paths
    const oldDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
    const newDir = path.join(__dirname, 'uploads');

    // Create new directory if it doesn't exist
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
        console.log('✅ Created database/uploads directory');
    }

    // Check if old directory exists
    if (!fs.existsSync(oldDir)) {
        console.log('⚠️  No frontend/public/uploads directory found');
        console.log('✅ Migration complete (no files to move)');
        return;
    }

    // Get all files from old directory
    const files = fs.readdirSync(oldDir);
    console.log(`📁 Found ${files.length} file(s) to migrate`);

    let movedCount = 0;
    let updatedCount = 0;

    for (const fileName of files) {
        const oldPath = path.join(oldDir, fileName);
        const newPath = path.join(newDir, fileName);

        // Skip if not a file
        if (!fs.statSync(oldPath).isFile()) {
            continue;
        }

        // Move file
        fs.copyFileSync(oldPath, newPath);
        console.log(`  ✓ Moved: ${fileName}`);
        movedCount++;

        // Update database record
        const oldDbPath = `/uploads/${fileName}`;
        const newDbPath = `../database/uploads/${fileName}`;

        try {
            const result = await prisma.file.updateMany({
                where: { path: oldDbPath },
                data: { path: newDbPath }
            });

            if (result.count > 0) {
                console.log(`    ✓ Updated ${result.count} database record(s)`);
                updatedCount += result.count;
            }
        } catch (error) {
            console.error(`    ✗ Error updating database for ${fileName}:`, error.message);
        }

        // Delete old file
        fs.unlinkSync(oldPath);
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Files moved: ${movedCount}`);
    console.log(`   Database records updated: ${updatedCount}`);
    console.log('✅ Migration complete!');

    await prisma.$disconnect();
}

migrateFiles().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
