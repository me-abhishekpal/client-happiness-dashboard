const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Checking available models on prisma instance:');
console.log(Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

// Check keys in dmmf if available (internal property)
if (prisma._dmmf) {
    const titleModel = prisma._dmmf.modelMap.Title;
    if (titleModel) {
        console.log('Title model found in DMMF.');
        console.log('Fields:', titleModel.fields.map(f => f.name));
    } else {
        console.log('Title model NOT found in DMMF.');
    }
} else {
    console.log('DMMF not available on instance.');
}

// Check by trying to access the delegate property if it exists (usually lowercased model name)
if (prisma.title) {
    console.log('prisma.title delegate exists.');
} else {
    console.log('prisma.title delegate DOES NOT exist.');
}
