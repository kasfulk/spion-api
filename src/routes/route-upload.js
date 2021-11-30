import express from 'express';
import { upload } from '../handlers/index.js';
import aws from '../helpers/aws.js';

const router = express.Router();

router.get('/', upload.indexPage);
router.post('/', upload.doUpload);

export default router;