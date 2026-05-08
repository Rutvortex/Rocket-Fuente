import 'dotenv/config';
import app from './src/app.js';
import ConnectDB from './src/DataBase/Conection.js';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await ConnectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 SocialNet API server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();