const mongoose = require('mongoose');
require('dotenv').config();

const dumpIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const colInfo of collections) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            const indexes = await collection.indexes();

            console.log(`\n📂 Collection: ${colName}`);
            indexes.forEach(idx => {
                console.log(`   🔸 ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dumpIndexes();
