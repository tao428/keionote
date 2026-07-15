import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRouter from './routes/auth.routes';
import itemRouter from './routes/item.routes';
import lectureRouter from './routes/lecture.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// APIルーティング
app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);
app.use('/api/lectures', lectureRouter); // timetableもここから処理

// API健康診断
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KeioNote API is running' });
});

// Socket.IO セットアップ
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 本番環境での静的ファイル配信
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// エラーハンドラー
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
