import express from 'express';
import { auth } from '../handlers/index.js';

const router = express.Router();

router.post('/login', auth.login);

export default router;
