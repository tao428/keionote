import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/request-otp', AuthController.requestOTP);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.getMe);
router.put('/me', authenticateToken, AuthController.updateProfile);

// 開発デバッグ用
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/otps', AuthController.getDebugOTPs);
}

export default router;
