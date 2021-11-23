import express from 'express';
import { auth } from '../handlers/index.js';

const router = express.Router();

router.post('/check-payload', auth.checkPayload);

export default router;
