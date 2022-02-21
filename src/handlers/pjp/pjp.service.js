import pool from "../../helpers/db.js";
import { dbUpdate } from "../../utils/db.js";
import { getDay } from '../../utils/date.js';

const getPJPDuration = async (req, res) => {
    const { user } = req;
    const day = getDay(new Date());

    const divider = day == "Sabtu" ? 180 : 270;

    const query = `SELECT
                    ROUND(${divider}/COUNT(OUTLET_ID),0) AS pjp_duration,
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
        const duration = Number(pjp_duration) >= 30 ? 30 : Number(pjp_duration);
        res.status(200).json({
            pjp_duration: Number(duration),
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
        const { reportId, outletId, brandId, stock } = req.body;

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
        res.status(200).json(result[0]);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const updatePjpReport = async (req, res) => {
    const { user, body } = req;
    const { reportId } = req.params;

    console.log(body);

    try {

        for (const key in body) {
            switch (key) {
                case 'pjp_linkaja_balance':
                    body['pjp_linkaja_balance'] = Number(body['pjp_linkaja_balance']);
                    break;
                case 'diamond_spot':
                    body['diamond_spot'] = Number(body['diamond_spot']);
                    break;

                // new-est
                case 'pjp_status_branding_id':
                    body['pjp_status_branding_id'] = Number(body['pjp_status_branding_id']);
                    break;

                case 'pjp_status_display_id':
                    body['pjp_status_display_id'] = Number(body['pjp_status_display_id']);
                    break;

                case 'pjp_status_transaction_id':
                    body['pjp_status_transaction_id'] = Number(body['pjp_status_transaction_id']);
                    break;

                case 'pjp_status_promotion_id':
                    body['pjp_status_promotion_id'] = Number(body['pjp_status_promotion_id']);
                    break;

                default:
                    body[key] = body[key];
                    break;
            }
        }

        const update = await dbUpdate('pjp_report', {
            ...body,
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

const updatePjpReportMochan = async (req, res) => {
    const { user, body } = req;
    const { reportId } = req.params;

    console.log(body);

    try {

        const update = await dbUpdate('pjp_report_mochan', {
            ...body,
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

const insertPjpReportStatus = async (req, res) => {
    const { outletId, pjp_schedule_id, status_branding, status_display, status_transaksi, status_promotion } = req.body;

    try {

        const query = `INSERT INTO pjp_report_status (outlet_id, sf_id, pjp_schedule_id, status_branding, status_display, status_transaksi, status_promotion) VALUES (?, ?, ?, ?, ?, ?, ?);`;
        const params = [outletId, req.user.id, pjp_schedule_id, status_branding, status_display, status_transaksi, status_promotion];

        const [result, metadata] = await pool.query(query, params);

        if (result.affectedRows != 0) {
            res.status(200).json({
                'status': 201,
                'message': 'Input Pjp Status Success'
            });
        } else {
            res.status(400).json();
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const getDataStatus = async (req, res) => {
    const { tableName } = req.params;
    try {

        const query = `SELECT * FROM ${tableName}`;

        const [result] = await pool.query(query);

        if (result.affectedRows != 0) {
            res.status(200).json({
                'status': 200,
                'message': `Get Data ${tableName} Success`,
                'data': result
            });
        } else {
            res.status(400).json();
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}

const insertPjpReportStatusEupPrice = async (req, res) => {
    const { outletId, report_id, cap_tsel, price_tsel, cap_isat, price_isat, cap_tri, price_tri, cap_xl, price_xl, cap_sf, price_sf } = req.body;

    const { tableName } = req.params;

    try {
        const query = `INSERT INTO ${tableName} (
            outlet_id, 
            report_id, 
            sf_id, 
            cap_tsel, 
            price_tsel, 
            cap_isat, 
            price_isat, 
            cap_tri, 
            price_tri, 
            cap_xl, 
            price_xl, 
            cap_sf, 
            price_sf
            ) VALUES (
            ?, 
            ?, 
            ?, 
            ?,
            ?, 
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
            );`;
        const params = [outletId, report_id, req.user.id, cap_tsel, price_tsel, cap_isat, price_isat, cap_tri, price_tri, cap_xl, price_xl, cap_sf, price_sf];

        const [result, metadata] = await pool.query(query, params);

        if (result.affectedRows != 0) {
            res.status(200).json({
                'status': 201,
                'message': `Input Pjp EUP Price Success to ${tableName}`
            });
        } else {
            res.status(400).json();
        }
    }
    catch (err) {
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
    updatePjpReportMochan,
    getPjpReport,
    insertPjpBarcode,
    deletePjpBarcode,
    getPjpBarcode,
    getPjpBarcodeList,
    insertPjpReportStatus,
    getDataStatus,
    insertPjpReportStatusEupPrice
}