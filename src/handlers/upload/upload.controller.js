const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
};

const uploadImage = (req, res) => {
    res.send({
        message: 'berhasil',
        fileName: req.file.originalname,
        uploadedFileName: req.file.key,
        file: req.file,
    });
};
  
export default { 
    indexPage,
    uploadImage,
};