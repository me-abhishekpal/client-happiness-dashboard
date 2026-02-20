const { Pool } = require('pg');
const bcrypt = require('/app/node_modules/bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const hash = bcrypt.hashSync('aoidu8eyeuya87', 10);
    const result = await pool.query(
        `UPDATE "User" SET "passwordHash" = $1 WHERE email = $2`,
        [hash, 'jason.diaz57@example.com']
    );
    if (result.rowCount > 0) {
        console.log('✅ Password updated successfully for jason.diaz57@example.com');
    } else {
        console.error('❌ User not found');
    }
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => pool.end());
