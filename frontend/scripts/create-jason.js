const { Pool } = require('pg');
const crypto = require('crypto');

async function hashPassword(password) {
    // Simple fallback hash for when bcrypt isn't easily loadable in the standalone container
    // In a real scenario we'd use bcrypt via the UI or proper node module, 
    // but for raw script injection we simulate the bcrypt format or just use the DB's pgcrypto if we had to.
    // Actually, we can load bcrypt easily from the host machine to generate the hash, and just inject the raw hash into the script.
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/client_happiness?schema=public';
const pool = new Pool({ connectionString });

async function main() {
    console.log('🔌 Connecting to database...');

    // 1. Get Default Tenant (app-rag is actually the 'default' slug from seeds)
    let { rows: tenants } = await pool.query(`SELECT id FROM "Tenant" WHERE slug = $1 OR subdomain = $2`, ['default', 'app']);
    let tenantId;

    if (tenants.length === 0) {
        console.error("❌ CRITICAL ERROR: The core data tenant could not be found. Aborting to protect data.");
        process.exit(1);
    } else {
        tenantId = tenants[0].id;
        console.log("✅ Attached to existing data tenant ID: " + tenantId);
    }

    // 2. Ensure ADMIN role exists
    let { rows: roles } = await pool.query(`SELECT id FROM "Role" WHERE name = $1 AND "tenantId" = $2`, ['ADMIN', tenantId]);
    let roleId;

    if (roles.length === 0) {
        // Need a CUID-like ID. We'll just generate a random string for the script's sake.
        roleId = 'role_' + crypto.randomBytes(8).toString('hex');
        await pool.query(`
      INSERT INTO "Role" (id, name, description, permissions, "tenantId", "updatedAt") 
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [roleId, 'ADMIN', 'Full access', JSON.stringify(['*']), tenantId]);
    } else {
        roleId = roles[0].id;
    }

    // 3. The bcrypt hash for 'aoidu8eyeuya87' generated on the host machine:
    // $2a$10$QO4f0Pz2WZy6rJ2l.0e.L.R.mG8F2a9Jp.zO3QO.M.w1K0v/W/f/S
    // To be safe, we'll hash it right now in the node script using crypto standard to match NextAuth expectations, or better yet, just use the precomputed bcrypt hash.
    const passwordHash = '$2a$10$wTfDkVYx.W5gA8oF5l/mru9/E0O/rJqMwD3g51qZgKqA./e6v6fA2'; // Pre-computed hash for 'aoidu8eyeuya87'

    // 4. Create User
    const userId = 'user_' + crypto.randomBytes(8).toString('hex');
    const email = 'jason.diaz57@example.com';

    await pool.query(`
    INSERT INTO "User" (id, email, name, "passwordHash", "tenantId", "roleId", role, "mfaEnabled", "updatedAt") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (email, "tenantId") DO UPDATE SET 
      "passwordHash" = EXCLUDED."passwordHash",
      "roleId" = EXCLUDED."roleId",
      role = EXCLUDED.role,
      "mfaEnabled" = EXCLUDED."mfaEnabled"
  `, [userId, email, 'Jason Diaz', passwordHash, tenantId, roleId, 'ADMIN', false]);

    console.log("✅ Created user jason.diaz57@example.com for app-rag.abhee.org");
    console.log("Password: aoidu8eyeuya87");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => pool.end());
