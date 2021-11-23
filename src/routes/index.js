import express from 'express';
import routerAuth from './route-auth.js';
import authController from '../handlers/auth/auth.controller.js';

const router = express.Router();

router.use('/user', routerAuth);

export default router;
