import aws from '../../helpers/aws.js';

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
};

const doUpload = (req, res) => {
    aws.upload(req, res, (err) => {
        if (err) {
            return res.status(500).send({
                message: err.message
            });
        } else {
            console.log(req.file);
            res.send({
                message: 'berhasil',
                fileName: req.file.originalname,
                uploadedFileName: req.file.key,
                file: req.file,
            })
        }
    });
};
  
export default { 
    indexPage,
    doUpload,
};