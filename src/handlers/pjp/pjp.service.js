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
    const { reportId,outletId, brandId, stock } = req.body;

    const query = `INSERT INTO pjp_report_physical_stock (report_id, outlet_id, brand_id, stock, created_by, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())`;
    const params = [reportId, outletId, brandId, stock, user.id];
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
    const query = `DELETE FROM pjp_report_physical_stock WHERE id = ? AND created_by = ?`;
    const params = [id, user.id];
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
                    reference_brand`;
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
                    WHERE id = ? AND
                    sf_id = ?`;
    const params = [reportId, req.user.id];
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
    const {
        pjp_selfie_photo_link, 
        pjp_linkaja_photo_link, 
        pjp_display_photo_link, 
        pjp_linkaja_balance, 
        pjp_physic_stock_photo_link, 
        pjp_transaction_photo_link, 
        pjp_transaction_note_photo_link, 
        pjp_competitor_photo_link, 
        pjp_eup_price_photo_link
    } = req.body;

    try {
        const update = await dbUpdate('pjp_report', {
            pjp_selfie_photo_link, 
            pjp_linkaja_photo_link, 
            pjp_display_photo_link, 
            pjp_linkaja_balance, 
            pjp_physic_stock_photo_link, 
            pjp_transaction_photo_link, 
            pjp_transaction_note_photo_link, 
            pjp_competitor_photo_link, 
            pjp_eup_price_photo_link
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
}