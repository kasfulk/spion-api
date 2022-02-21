import express from 'express';
import { outlet } from '../handlers/index.js';

const router = express.Router();

router.get('/', outlet.indexPage);
router.get('/day', outlet.getDayService);
router.get('/list-daily', outlet.getOutletCheckInService);
router.patch('/check', outlet.outletCheckAction);
router.patch('/check-mochan', outlet.outletMochanCheckAction);
router.patch('/state/:outletId', outlet.outletStateAction);

export default router;
