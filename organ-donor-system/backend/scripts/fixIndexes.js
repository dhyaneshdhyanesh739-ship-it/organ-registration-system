const mongoose = require('mongoose');
require('dotenv').config();

const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const colInfo of collections) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            console.log(`\n📂 Checking collection: ${colName}`);

            const indexes = await collection.indexes();
            console.log(`   Found ${indexes.length} indexes:`, indexes.map(i => i.name).join(', '));

            let dropped = false;
            for (const idx of indexes) {
                // Check if index involves 'userId' field
                if (idx.key && idx.key.userId) {
                    console.log(`   🛠 Found 'userId' index: ${idx.name}. Dropping...`);
                    try {
                        await collection.dropIndex(idx.name);
                        console.log(`   ✅ Successfully dropped index: ${idx.name}`);
                        dropped = true;
                    } catch (e) {
                        console.log(`   ❌ Failed to drop index ${idx.name}: ${e.message}`);
                    }
                }
            }
            if (!dropped) console.log(`   ✨ No 'userId' indexes found in ${colName}`);
        }

        console.log('\n🏁 Finished processing all collections.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dropIndexes();
