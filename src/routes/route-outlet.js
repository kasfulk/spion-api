import express from 'express';
import { outlet } from '../handlers/index.js';

const router = express.Router();

router.get('/', outlet.indexPage);
router.get('/day', outlet.getDayService);
router.get('/list-daily', outlet.getOutletCheckInService);
router.patch('/check', outlet.outletCheckAction);

export default router;