import express from 'express';
import routerUser from './route-user.js';
import routerOutlet from './route-outlet.js';
import routerPjp from './route-pjp.js';

const router = express.Router();

router.use('/user', routerUser);
router.use('/outlet', routerOutlet);
router.use('/pjp', routerPjp);

export default router;
