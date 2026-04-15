import mongoose from 'mongoose';

const ConnectDB = async(mongoUri) => {
    if(!mongoUri){
        throw new Error('MONGO_URI es requerido we, o algo asi')
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB')
};

export default ConnectDB;