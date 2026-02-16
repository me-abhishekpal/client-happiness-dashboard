const fs = require('fs');
const path = require('path');

async function check() {
    console.log('--- Checking Runtime Client ---');
    try {
        // Try to require the client from frontend location
        const { PrismaClient } = require('./frontend/node_modules/@prisma/client');
        const prisma = new PrismaClient();

        // Check models
        const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
        console.log('Available models:', models);

        if (models.includes('title')) {
            console.log('SUCCESS: Runtime client has "title" model.');
        } else {
            console.log('FAILURE: Runtime client MISSING "title" model.');
        }
    } catch (e) {
        console.log('Error checking runtime client:', e.message);
    }

    console.log('\n--- Checking Type Definitions (.d.ts) ---');
    const dtsPath = path.join(__dirname, 'frontend/node_modules/.prisma/client/index.d.ts');
    if (fs.existsSync(dtsPath)) {
        console.log(`Found index.d.ts at ${dtsPath}`);
        const content = fs.readFileSync(dtsPath, 'utf-8');

        // Check for Title model definition
        if (content.includes('model Title')) { // This comment exists in d.ts? No, usually generated differently.
            // Look for model type definition
            // "export type Title = {"
            if (content.includes('export type Title = {') || content.includes('export type Title = (')) {
                console.log('SUCCESS: Type definition for Title found.');
            } else {
                console.log('FAILURE: Type definition for Title NOT found (checked "export type Title").');
            }

            // Check for delegate
            // "title: Prisma.TitleDelegate"
            if (content.includes('title: Prisma.TitleDelegate')) {
                console.log('SUCCESS: Delegate definition for title found.');
            } else {
                console.log('FAILURE: Delegate definition for title NOT found.');
            }

            if (content.includes('reportsTo')) {
                console.log('SUCCESS: "reportsTo" field found in definitions.');
            } else {
                console.log('FAILURE: "reportsTo" field NOT found in definitions.');
            }

        } else {
            // Fallback check
            if (content.includes('Title')) {
                console.log('INFO: "Title" string found in file, but specific checks failed.');
            } else {
                console.log('FAILURE: "Title" string NOT found in file.');
            }
        }
    } else {
        console.log(`FAILURE: index.d.ts NOT found at ${dtsPath}`);
    }
}

check();
