import pool from "../../helpers/db.js";
import { dbUpdate } from "../../utils/db.js";
import { getDay } from '../../utils/date.js';

const getPJPDuration = async (req, res) => {
    const { user } = req;
    const day = getDay(new Date());
    
    const query = `SELECT
                    ROUND(270/COUNT(OUTLET_ID),0) AS pjp_duration,
                    COUNT(OUTLET_ID) AS total_outlets
                    FROM
                    pjp_schedule
                    WHERE
                    sales_force_id = ? AND
                    day = ?`;
    const params = [user.id, day];
    try {
        const [result, metadata] = await pool.query(query, params);
        const { pjp_duration, total_outlets } = result[0];
        res.status(200).json({
            pjp_duration: Number(pjp_duration),
            total_outlets: Number(total_outlets)
        });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const getPjpBarcodeList = async (req, res) => {
    const { reportId } = req.params;
    
    const query = `SELECT
                    *
                    FROM pjp_barcode
                    WHERE
                    report_id = ?;`;
    const params = [reportId];
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getPjpBarcode = async (req, res) => {
    const { user } = req;
    const { sn } = req.params;
    
    const query = `SELECT
                    *
                    FROM pjp_barcode
                    WHERE
                    sn = ?;`;
    const params = [sn];
    try {
        const [result, metadata] = await pool.query(query, params);
        const resultData = result[0];
        res.status(200).json(resultData);
    } catch (err) {
        res.status(500).json(err);
    }
}


const insertPjpBarcode = async (req, res) => {
    const { user } = req;
    const { reportId, outletId, sn } = req.body;

    //check sn
    const queryCheck = `SELECT
                    COUNT(*) AS total
                    FROM
                    pjp_barcode
                    WHERE
                    sn = ?`;
    const paramsCheck = [sn];

    
    try {
        const [resultCheck, metadataCheck] = await pool.query(queryCheck, paramsCheck);
        
        if (resultCheck[0].total > 0) {
            res.status(400).json({
                message: "SN already exist"
            });
            return;
        }

        const query = `INSERT INTO pjp_barcode (report_id, outlet_id, sn, created_by) VALUES (?, ?, ?, ?);
                        SELECT * FROM pjp_barcode WHERE id = LAST_INSERT_ID()`;
        const params = [reportId, outletId, sn, user.id];

        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result[1][0]);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const deletePjpBarcode = async (req, res) => {
    const { user } = req;
    const { sn } = req.params;
    
    const query = `DELETE FROM pjp_barcode WHERE sn = ? AND created_by = ?`;
    const params = [sn, user.id];
    
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const getPhysicalStock = async (req, res) => {
    const { reportId } = req.params;
    const query = `SELECT
                    a.id,
                    a.outlet_id,
                    a.report_id,
                    a.brand_id,
                    b.brand,
                    a.stock
                    FROM
                    pjp_report_physical_stock a
                    JOIN
                    reference_brand b
                    ON
                    a.brand_id = b.id
                    WHERE report_id = ?`;
    const params = [reportId];
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const insertPhysicalStock = async (req, res) => {
    const { user } = req;
    let query = '';
    let params = [];
    if (req.body.length) {
        const preparedData = req.body.map(item => {
            return `(?, ?, ?, ?, ?)`;
        });
        const insertData = req.body.map(item => {
            return [item.outletId, item.reportId, item.brandId, item.stock, user.id];
        });
        query = `INSERT INTO pjp_report_physical_stock (
                        outlet_id,
                        report_id,
                        brand_id,
                        stock,
                        created_by
                        ) VALUES ${preparedData.join(',')}`;
        params = insertData.flat();
        
    } else {
        const { reportId,outletId, brandId, stock } = req.body;

        query = `INSERT INTO pjp_report_physical_stock (report_id, outlet_id, brand_id, stock, created_by, created_at)
                        VALUES (?, ?, ?, ?, ?, NOW())`;
        params = [reportId, outletId, brandId, stock, user.id];    
    }
    
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const deletePhysicalStock = async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const query = `DELETE FROM pjp_report_physical_stock WHERE (id = ? OR outlet_id = ?) AND created_at = DATE(NOW()) AND created_by = ?`;
    const params = [id, id, user.id];
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
}
    

const getListBrand = async (req, res) => {
    const query = `SELECT
                    id,
                    brand
                    FROM
                    reference_brand
                    WHERE is_active = 1`;
    try {
        const [result, metadata] = await pool.query(query);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const getPjpReport = async (req, res) => {
    const { reportId } = req.params;
    const query = `SELECT
                    *
                    FROM
                    pjp_report
                    WHERE ( id = ? OR outlet_id = ? )  AND
                    DATE(created_at) = DATE(NOW()) AND
                    sf_id = ?`;
    const params = [reportId, reportId, req.user.id];
    try {
        const [result, metadata] = await pool.query(query, params);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const updatePjpReport = async (req, res) => {
    const { user } = req;
    const { reportId } = req.params;

    try {
        const update = await dbUpdate('pjp_report', {
            ...req.body,
        }, {
            wheres: {
                id: reportId,
                sf_id: user.id,
            }
        });
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json(err);
    }
}


export default {
    getPJPDuration,
    getPhysicalStock,
    getListBrand,
    insertPhysicalStock,
    deletePhysicalStock,
    updatePjpReport,
    getPjpReport,
    insertPjpBarcode,
    deletePjpBarcode,
    getPjpBarcode,
    getPjpBarcodeList
}