import express from 'express';
import { login, getCurrentUser, getAgents } from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/agents', authenticateToken, authorizeRole(['Admin']), getAgents);

export default router;
