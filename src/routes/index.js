import express from 'express';
import routerUser from './route-user.js';
import authController from '../handlers/auth/auth.controller.js';

const router = express.Router();

router.use('/user', routerUser);

export default router;
