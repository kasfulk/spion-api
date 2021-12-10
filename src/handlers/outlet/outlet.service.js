import { getDay, getDate } from '../../utils/date.js';
import { haversine } from '../../utils/haversine.js';
import pool from "../../helpers/db.js";

const getDayService = (req, res) => { 
    const day = getDay(new Date());
    res.status(200).json({
        day
    });
}

const getOutletCheckInService = async (req, res) => {
    const { longitude, latitude } = req.query;
    
    if (!longitude || !latitude) {
        res.status(400).json({
            message: "Missing required parameters"
        });
        return;
    }

    const { user } = req;
    const day = getDay(new Date());
    const query = `SELECT
                outlet_list.*,
            IF
                ( ISNULL( check_in.outlet_id ), 0, 1 ) AS isCheckIn,
            IF
                ( ISNULL( check_out.outlet_id ), 0, 1 ) AS isCheckOut 
            FROM
                (
                SELECT
                    a.outlet_id,
                    a.urutan,
                    b.outlet AS nama_outlet,
                    b.latitude,
                    b.longitude,
                    FORMAT((((
                                    acos(
                                        sin((
                                               ? * pi()/ 180 
                                                )) * sin((
                                                latitude * pi()/ 180 
                                                )) + cos((
                                               ? * pi()/ 180 
                                                )) * cos((
                                                latitude * pi()/ 180 
                                                )) * cos(((
                                                    ? - longitude 
                                                )* pi()/ 180 
                                            )))) * 180 / pi()) * 60 * 1.1515 
                            ) * 1.609344,
                        1 
                    ) AS distance 
                FROM
                    pjp_schedule a
                    LEFT JOIN outlet b ON a.outlet_id = b.outlet_id 
                WHERE
                    DAY = ?
                    AND sales_force_id = ?
                    ORDER BY urutan ASC
                ) outlet_list
                LEFT JOIN (
                SELECT
                    outlet_id 
                FROM
                    pjp_check_in 
                WHERE
                    DATE( date ) = DATE(
                    NOW())
                    AND sf_id = ?
                ) check_in ON outlet_list.outlet_id = check_in.outlet_id
                LEFT JOIN (
                SELECT
                    outlet_id 
                FROM
                    pjp_check_out 
                WHERE
                DATE( date ) = DATE(
                NOW())
                    AND sf_id = ?
                ) check_out ON outlet_list.outlet_id = check_out.outlet_id
                LEFT JOIN (
                    SELECT isClosed,needConfirm,outlet_id FROM outlet_state WHERE date = DATE(NOW())
                ) outletstate ON outlet_list.outlet_id = outletstate.outlet_id`;
    const params = [latitude, latitude, longitude, day, user.id,user.id,user.id];
    const [results, metadata] = await pool.query(query, params);
    if (results.length > 0) {
        console.log(results);
        res.status(200).json({
            results: results.map(item => {
                return {
                    urutan: item.urutan,
                    outlet_id: item.outlet_id,
                    nama_outlet: item.nama_outlet,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    distance: item.distance,
                    isCheckedIn: item.isCheckIn == 1 ? true : false,
                    isCheckedOut: item.isCheckOut == 1 ? true : false,
                    isClosed: item.isClosed == 1 ? true : false,
                    needConfirm: item.needConfirm == 1 ? true : false
                }
            })
        });
    } else {
        res.status(404).json({
            message: "Data not found!"
        });
    }
}

const outletCheckAction = async (req, res) => {
    const { action, outlet_id, longitude, latitude } = req.body;
    const { user } = req;
    const allowedActions = ['in', 'out'];
    const params = [outlet_id, user.id, longitude, latitude];
    const day = getDay(new Date());
    
    if (!allowedActions.includes(action)) res.status(400).json({ message: "Invalid action" });
    if (!outlet_id) res.status(400).json({ message: "Missing required parameters" });

    const queryOutlet = `SELECT * FROM outlet WHERE outlet_id = ?`;
    const [resultOutlet, metadata] = await pool.query(queryOutlet, [outlet_id]);

    const distance = haversine(
        {
            lat: latitude,
            lon: longitude
        },
        {
            lat: resultOutlet[0].latitude,
            lon: resultOutlet[0].longitude
        });

    if (distance > 15) {
        res.status(400).json({ message: "Outlet is not in range" });
        return;
    }

    const queryCheck = `
            SELECT
            b.id AS report_id,
            a.created_at as check_${action}_time,
            a.longitude as check_${action}_longitude,
            a.latitude as check_${action}_latitude,
            b.pjp_schedule_id
            FROM pjp_check_${action} a
            LEFT JOIN
            pjp_report b
            ON a.outlet_id = b.outlet_id
            WHERE a.outlet_id = ?
            AND a.sf_id = ?
            AND DATE(b.created_at) = DATE(NOW())
            AND DATE( a.date ) = DATE(NOW())`;
    
    try {
        const [results, metadata] = await pool.query(queryCheck, params);

        if (results.length == 0) {
            
            if (action == 'out') {
                const queryCheckIn = `SELECT * FROM pjp_check_in WHERE outlet_id = ? AND sf_id = ? AND DATE( date ) = DATE(NOW())`;
                const [resultsCheckIn, metadataCheckIn] = await pool.query(queryCheckIn, params);
                if (resultsCheckIn.length == 0) {
                    res.status(400).json({ message: "Check in not found" });
                    return;
                }
            }

            const insertQuery = `INSERT INTO pjp_check_${action} (outlet_id, sf_id, date, longitude, latitude) VALUES (?, ?, NOW(), ?, ?);
                                SELECT * FROM pjp_check_${action} WHERE id = LAST_INSERT_ID()`;
            const checkPjpSchedule = `SELECT * FROM
                                    pjp_schedule
                                    WHERE
                                    DAY = ? AND
                                    sales_force_id = ? AND
                                    outlet_id = ?`;
            const [resultsCheck, metadataCheck] = await pool.query(checkPjpSchedule, [day, user.id, outlet_id]);
            
            if (resultsCheck.length == 0) {
                res.status(400).json({ message: "Outlet PJP is not on your schedule!" });
                return;
            }

            if (action == 'in') {
                const createPjpReportQuery = `INSERT INTO pjp_report (pjp_schedule_id,sf_id,outlet_id,longitude,latitude) VALUES (?, ?, ?, ?, ?);
                                            SELECT * FROM pjp_report WHERE id = LAST_INSERT_ID()`;
                const [createPjpReport, metadataCreatePjpReport] = await pool.query(createPjpReportQuery, [resultsCheck[0].id, user.id, outlet_id, longitude, latitude]);
                const [insertResult, insertMetadata] = await pool.query(insertQuery, params);
                res.status(200).json({
                    message: `Checked ${action} successfully!`,
                    pjpReport: createPjpReport[1][0] ? createPjpReport[1][0] : null,
                    check: insertResult[1][0] ? insertResult[1][0] : null,
                });
                return;
            } else {
                const [insertResult, insertMetadata] = await pool.query(insertQuery, params);
                res.status(200).json({
                    message: `Checked ${action} successfully!`,
                    check: insertResult[1][0] ? insertResult[1][0] : null,
                });
                return;
            }

            
        } else {
            res.status(400).json({
                checked: true,
                message: `You have already checked ${action} today!`,
                checkData: results[0]
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
    
}

const outletStateAction = async (req, res) => {
    const { outletId } = req.params;
    let { isClosed, needConfirm } = req.body;
    const date = getDate(new Date());

    if (!outletId) res.status(400).json({ message: "Missing required parameters" });
    
    const queryOutlet = `SELECT * FROM outlet_state WHERE outlet_id = ? AND date  = ?`;
    const [resultOutlet, metadata] = await pool.query(queryOutlet, [outletId, date]);

    if (resultOutlet.length == 0) {
        const isClosedData = isClosed ? 1 : 0;
        const needConfirmData = needConfirm ? 1 : 0;
        const insertQuery = `INSERT INTO outlet_state (outlet_id, date, isClosed, needConfirm) VALUES (?, ?, ?, ?);
                            SELECT * FROM outlet_state WHERE outlet_id = ? AND date = ?`;
        const [insertResult, insertMetadata] = await pool.query(insertQuery, [outletId, date, isClosedData, needConfirmData,outletId, date]);
        res.status(200).json({
            message: "Outlet state inserted successfully!",
            outlet: insertResult[1][0] ? insertResult[1][0] : null
        });
    } else {
        if (isClosed == null) isClosed = resultOutlet[0].isClosed;
        if (needConfirm == null) needConfirm = resultOutlet[0].needConfirm;

        const isClosedData = isClosed ? 1 : 0;
        const needConfirmData = needConfirm ? 1 : 0;

        const updateQuery = `UPDATE outlet_state SET isClosed = ?, needConfirm = ? WHERE outlet_id = ? AND date = ?;
                            SELECT * FROM outlet_state WHERE outlet_id = ? AND date = ?`;
        const [updateResult, updateMetadata] = await pool.query(updateQuery, [isClosedData, needConfirmData, outletId, date, outletId, date]);
        res.status(200).json({
            message: "Outlet state updated successfully!",
            outlet: updateResult[1][0] ? updateResult[1][0] : null
        });
    }
}





export default {
    getDayService,
    getOutletCheckInService,
    outletCheckAction,
    outletStateAction,
}