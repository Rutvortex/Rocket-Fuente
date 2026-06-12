import 'dotenv/config';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server as SocketIO } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/app.js';
import ConnectDB from './src/DataBase/Conection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5000;
const USE_HTTPS = process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';

// ── WebRTC signaling rooms ────────────────────────────────────────────────────
// rooms: Map<roomId, { hostId, title, viewers: Set<socketId> }>
const rooms = new Map();

const startServer = async () => {
  try {
    await ConnectDB(process.env.MONGO_URI);

    // Create HTTPS server if certificates exist, otherwise fallback to HTTP
    let httpServer;
    const certPath = path.join(__dirname, 'certs', 'localhost.pem');
    const keyPath = path.join(__dirname, 'certs', 'localhost-key.pem');
    
    if (USE_HTTPS || (fs.existsSync(certPath) && fs.existsSync(keyPath))) {
      try {
        const cert = fs.readFileSync(certPath, 'utf8');
        const key = fs.readFileSync(keyPath, 'utf8');
        httpServer = createHttpsServer({ cert, key }, app);
        console.log('🔒 Using HTTPS with local certificates');
      } catch (error) {
        console.warn('⚠️  Failed to load HTTPS certificates, falling back to HTTP:', error.message);
        httpServer = createHttpServer(app);
      }
    } else {
      httpServer = createHttpServer(app);
    }

    const normalizeOrigin = (raw) => raw.trim().replace(/\/$/, '');
    const envSocketOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map(normalizeOrigin)
      .filter(Boolean);
    const defaultSocketOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://localhost:5173',
      'https://127.0.0.1:5173',
    ];
    const socketOrigins = [...new Set([...envSocketOrigins, ...defaultSocketOrigins])];

    const io = new SocketIO(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);

          const normalizedOrigin = normalizeOrigin(origin);
          const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production';
          const isAllowedLocalNetwork = !isProduction && /^https?:\/\/192\.168\.\d+\.\d+:5173$/.test(normalizedOrigin);

          callback(null, socketOrigins.includes(normalizedOrigin) || isAllowedLocalNetwork);
        },
        methods: ['GET', 'POST'],
      },
    });

    // Expose io via app for controllers to emit events
    app.set('io', io);

    // Broadcast active rooms list to all clients
    const broadcastRooms = () => {
      const list = Array.from(rooms.entries()).map(([id, r]) => ({
        id,
        title: r.title,
        host: r.host,
        viewers: r.viewers.size,
      }));
      io.emit('rooms:list', list);
    };

    io.on('connection', (socket) => {
      // Group chat: join/leave group rooms
      socket.on('group:join', ({ groupId }) => {
        if (!groupId) return;
        socket.join(`group:${groupId}`);
      });

      socket.on('group:leave', ({ groupId }) => {
        if (!groupId) return;
        socket.leave(`group:${groupId}`);
      });

      // HOST: starts a new live room
      socket.on('live:create', ({ roomId, title, host }) => {
        rooms.set(roomId, { hostId: socket.id, title, host, viewers: new Set() });
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.role = 'host';
        broadcastRooms();
      });

      // VIEWER: joins an existing room
      socket.on('live:join', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return socket.emit('live:error', 'Room not found');
        room.viewers.add(socket.id);
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.role = 'viewer';
        // Tell host a new viewer joined (so host can send offer)
        socket.to(room.hostId).emit('live:viewer-joined', { viewerId: socket.id });
        broadcastRooms();
      });

      // WebRTC signaling: offer (host → viewer)
      socket.on('live:offer', ({ to, offer }) => {
        io.to(to).emit('live:offer', { from: socket.id, offer });
      });

      // WebRTC signaling: answer (viewer → host)
      socket.on('live:answer', ({ to, answer }) => {
        io.to(to).emit('live:answer', { from: socket.id, answer });
      });

      // WebRTC signaling: ICE candidates (bidirectional)
      socket.on('live:ice', ({ to, candidate }) => {
        io.to(to).emit('live:ice', { from: socket.id, candidate });
      });

      // HOST: ends the live stream
      socket.on('live:end', ({ roomId }) => {
        rooms.delete(roomId);
        io.to(roomId).emit('live:ended');
        broadcastRooms();
      });

      // Get current room list
      socket.on('rooms:get', () => broadcastRooms());

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        const { roomId, role } = socket.data;
        if (!roomId) return;
        const room = rooms.get(roomId);
        if (!room) return;
        if (role === 'host') {
          rooms.delete(roomId);
          io.to(roomId).emit('live:ended');
        } else {
          room.viewers.delete(socket.id);
        }
        broadcastRooms();
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`🚀 SocialNet API server is running on port ${PORT}`);
      console.log(`📡 WebRTC signaling socket ready`);
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