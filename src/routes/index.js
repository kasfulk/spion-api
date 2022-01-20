import express from 'express';
import routerUser from './route-user.js';
import routerOutlet from './route-outlet.js';
import routerPjp from './route-pjp.js';
import upload from './route-upload.js';
import { tokenCheck } from '../helpers/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('<h1>Hayooo looo..</h1>');
});

router.use('/user', tokenCheck, routerUser);
router.use('/outlet', tokenCheck, routerOutlet);
router.use('/pjp', tokenCheck, routerPjp);
router.use('/upload', tokenCheck, upload);

export default router;