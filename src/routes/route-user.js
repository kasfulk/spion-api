import express from 'express';
import { auth } from '../handlers/index.js';

const router = express.Router();

router.get('/',auth.getUser);
router.get('/check-payload', auth.checkPayload);

export default router;
