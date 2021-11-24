import pjpService from "./pjp.service.js";

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
};

const getPJPDuration = (req, res) => {
    pjpService.getPJPDuration(req, res);
};
 
export default { 
    indexPage,
    getPJPDuration,
};