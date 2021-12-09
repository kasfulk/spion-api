import { getDay } from '../../utils/date.js';
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
                ) check_out ON outlet_list.outlet_id = check_out.outlet_id`;
    const params = [latitude, latitude, longitude, day, user.id,user.id,user.id];
    const [results, metadata] = await pool.query(query, params);
    if (results.length > 0) {
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
                    isCheckedOut: item.isCheckOut == 1 ? true : false
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
            SELECT * FROM pjp_check_${action} 
            WHERE outlet_id = ? 
            AND sf_id = ? 
            AND DATE( date ) = DATE(NOW())`;
    
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

            const createPjpReportQuery = `INSERT INTO pjp_report (pjp_schedule_id,sf_id,outlet_id,longitude,latitude) VALUES (?, ?, ?, ?, ?);
                                        SELECT * FROM pjp_report WHERE id = LAST_INSERT_ID()`;
            const [createPjpReport, metadataCreatePjpReport] = await pool.query(createPjpReportQuery, [resultsCheck[0].id, user.id, outlet_id, longitude, latitude]);
            const [insertResult, insertMetadata] = await pool.query(insertQuery, params);

            res.status(200).json({
                message: `Checked ${action} successfully!`,
                pjpReport: createPjpReport[1][0],
                check: insertResult[1][0],
            });
        } else {
            res.status(400).json({
                checked: true,
                message: `You have already checked ${action} today!`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
    
}





export default {
    getDayService,
    getOutletCheckInService,
    outletCheckAction,
}