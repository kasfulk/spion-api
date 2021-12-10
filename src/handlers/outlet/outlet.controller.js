import outletService from "./outlet.service.js";

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
};

const getDayService = (req, res) => {
    outletService.getDayService(req, res);
};

const getOutletCheckInService = (req, res) => {
    outletService.getOutletCheckInService(req, res);
};

const outletCheckAction = (req, res) => {
    outletService.outletCheckAction(req, res);
};

const outletStateAction = (req, res) => {
    outletService.outletStateAction(req, res);
};
  
export default { 
    indexPage,
    getDayService,
    getOutletCheckInService,
    outletCheckAction,
    outletStateAction,
};