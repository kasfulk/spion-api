import bangunanService from "./bangunan.service.js";

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
  };

const updateData = (req, res) => {
    bangunanService.updateBangunan(req, res);
}

const insertData = (req, res) => {
    bangunanService.insertBangunan(req, res);
}


export default { 
    indexPage,
    updateData,
    insertData,
    };