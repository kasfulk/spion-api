import express from 'express';
import { botWa } from '../controllers/index.js';

const router = express.Router();

router.get('/bot-wa/', botWa.indexPage);

export default router;
