const mongoose = require('mongoose');
require('dotenv').config();

const forceDrop = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const colInfo of collections) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            const indexes = await collection.indexes();

            for (const idx of indexes) {
                if (idx.key && idx.key.userId) {
                    console.log(`🔥 Dropping index ${idx.name} from ${colName}...`);
                    await collection.dropIndex(idx.name);
                }
            }
        }

        console.log('✅ Done.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

forceDrop();
