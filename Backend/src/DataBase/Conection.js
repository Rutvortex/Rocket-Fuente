import mongoose from 'mongoose';

const ConnectDB = async (mongoUri) => {
    try {
        if (!mongoUri) {
            throw new Error('MONGO_URI is required');
        }

        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(mongoUri);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

export default ConnectDB;