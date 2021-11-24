import express from 'express';
import { pjp } from '../handlers/index.js';

const router = express.Router();

router.get('/', pjp.indexPage);
router.get('/duration', pjp.getPJPDuration);

export default router;