import aws from '../../helpers/aws.js';
import pool from '../../helpers/db.js';

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
            res.send({
                message: 'berhasil',
                fileName: req.file?.originalname,
                uploadedFileName: req.file?.key,
                file: req.file,
            })
        }
    });
};

const uploadReport = async (req, res) => {
    const { field } = req.query;
    const { reportId } = req.params;
    const allowedField = [
        "pjp_selfie_photo_link",
        "pjp_linkaja_photo_link",
        "pjp_display_photo_link",
        "pjp_physic_stock_photo_link",
        "pjp_transaction_photo_link",
        "pjp_transaction_note_photo_link",
        "pjp_competitor_photo_link",
        "pjp_eup_price_photo_link"];
    if (!allowedField.includes(field)) {
        return res.status(400).send({
            message: "Invalid field"
        });
    }

    await aws.upload(req, res, (err) => {
        if (err) {
            return res.status(500).send({
                message: err.message
            });
        } else {
            const urlImage = String(req.file?.location).replace('itopkal.sgp1.digitaloceanspaces.com', 'itopkal.sgp1.cdn.digitaloceanspaces.com');
            const query = `UPDATE pjp_report SET ${field} = ? WHERE id = ?`;
            const params = [urlImage, reportId];
            try {
                const [result, metadata] = await pool.query(query, params);
            } catch (err) {
                res.status(500).json(err);
            }
            res.send({
                message: 'berhasil',
                fileName: req.file?.originalname,
                uploadedFileName: req.file?.key,
                file: req.file,
            })
        }
    });
};
                          
export default { 
    indexPage,
    doUpload,
    uploadReport,
};