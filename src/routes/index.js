import express from 'express';
import routerUser from './route-user.js';
import routerOutlet from './route-outlet.js';

const router = express.Router();

router.use('/user', routerUser);
router.use('/outlet', routerOutlet);

export default router;
