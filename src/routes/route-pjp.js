import express from 'express';
import { pjp } from '../handlers/index.js';

const router = express.Router();

router.get('/', pjp.indexPage);
router.get('/duration', pjp.getPJPDuration);
router.get('/list-brand', pjp.getListBrand);
router.get('/physical-stock/:reportId', pjp.getPhysicalStock);
router.post('/physical-stock', pjp.insertPhysicalStock);
router.delete('/physical-stock/:id', pjp.deletePhysicalStock);
router.get('/report/:reportId', pjp.getPjpReport);
router.patch('/report/:reportId', pjp.updatePjpReport);
router.get('/barcode/:sn', pjp.getPjpBarcode);
router.post('/barcode', pjp.insertPjpBarcode);
router.delete('/barcode/:sn', pjp.deletePjpBarcode);
router.get('/barcode-list/:reportId', pjp.getPjpBarcodeList);

// new-est
router.post('/status', pjp.insertPjpReportStatus);
router.get('/status/:tableName', pjp.getDataStatus);
router.post('/status/eup/:tableName', pjp.insertPjpReportStatusEupPrice);

export default router;