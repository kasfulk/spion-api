import express from 'express';
import { bangunan } from '../handlers/index.js';

const router = express.Router();

router.get('/bangunan/', bangunan.updateData);
router.get('/bangunan/insert', bangunan.insertData);

export default router;
