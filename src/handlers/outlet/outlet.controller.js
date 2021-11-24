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

  
export default { 
    indexPage,
    getDayService,
    getOutletCheckInService,
};