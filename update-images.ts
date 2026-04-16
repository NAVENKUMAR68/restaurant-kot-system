import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-kot';

const updateImages = async () => {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB natively');
        const db = client.db('smart-kot');
        const collection = db.collection('menuitems');

        const updates = [
            { name: /margherita/i, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500&auto=format&fit=crop' },
            { name: /iced latte/i, image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db88?q=80&w=500&auto=format&fit=crop' },
            { name: /spring roll/i, image: 'https://images.unsplash.com/photo-1590050858113-d4dff11eb8f4?q=80&w=500&auto=format&fit=crop' }
        ];

        for (const update of updates) {
            const result = await collection.updateMany(
                { name: update.name },
                { $set: { image: update.image } }
            );
            console.log(`Updated images for ${update.name}: ${result.modifiedCount} documents modified.`);
        }

        console.log('Update complete');
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        if (client) await client.close();
        process.exit(0);
    }
};

updateImages();

