import pjpService from "./pjp.service.js";

const indexPage = (req, res) => {
    res.send({
        message: 'berhasil',
    });
};

const getPJPDuration = (req, res) => {
    pjpService.getPJPDuration(req, res);
};

const getPhysicalStock = async (req, res) => {
    pjpService.getPhysicalStock(req, res);
};

const insertPhysicalStock = async (req, res) => {
    pjpService.insertPhysicalStock(req, res);
};

const deletePhysicalStock = async (req, res) => {
    pjpService.deletePhysicalStock(req, res);
};

const getPjpReport = async (req, res) => {
    pjpService.getPjpReport(req, res);
};

const updatePjpReport = async (req, res) => {
    pjpService.updatePjpReport(req, res);
};

const updatePjpReportMochan = async (req, res) => {
    pjpService.updatePjpReportMochan(req, res);
};

const getListBrand = async (req, res) => {
    pjpService.getListBrand(req, res);
};

const getPjpBarcode = async (req, res) => {
    pjpService.getPjpBarcode(req, res);
};

const insertPjpBarcode = async (req, res) => {
    pjpService.insertPjpBarcode(req, res);
};

const deletePjpBarcode = async (req, res) => {
    pjpService.deletePjpBarcode(req, res);
};

const getPjpBarcodeList = async (req, res) => {
    pjpService.getPjpBarcodeList(req, res);
};

const insertPjpReportStatus = async (req, res) => {
    pjpService.insertPjpReportStatus(req, res);
};

const getDataStatus = async (req, res) => {
    pjpService.getDataStatus(req, res);
};

const insertPjpReportStatusEupPrice = async (req, res) => {
    pjpService.insertPjpReportStatusEupPrice(req, res);
};

const insertPjpReportReqUser = async (req, res) => {
    pjpService.insertPjpReportReqUser(req, res);
};

export default {
    indexPage,
    getPJPDuration,
    getPhysicalStock,
    getListBrand,
    insertPhysicalStock,
    deletePhysicalStock,
    updatePjpReport,
    updatePjpReportMochan,
    getPjpReport,
    getPjpBarcode,
    insertPjpBarcode,
    deletePjpBarcode,
    getPjpBarcodeList,
    insertPjpReportStatus,
    getDataStatus,
    insertPjpReportStatusEupPrice,
    insertPjpReportReqUser
};