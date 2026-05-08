<<<<<<< HEAD
import mongoose from 'mongoose';

const ConnectDB = async (mongoUri) => {
    try {
        if (!mongoUri) {
            throw new Error('MONGO_URI is required');
        }

        const conn = await mongoose.connect(mongoUri, {
            // Opciones recomendadas para Mongoose 6+
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Salir del proceso en caso de error
    }
};

=======
import mongoose from 'mongoose';

const ConnectDB = async(mongoUri) => {
    if(!mongoUri){
        throw new Error('MONGO_URI es requerido we, o algo asi')
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB')
};

>>>>>>> da472721c3b5c77b212c15dc71c1468a1cf32603
export default ConnectDB;