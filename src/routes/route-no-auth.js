import express from 'express';
import { auth } from '../handlers/index.js';

const router = express.Router();

router.post('/login', auth.login);

router.post('/login-new', auth.loginNew);

export default router;
