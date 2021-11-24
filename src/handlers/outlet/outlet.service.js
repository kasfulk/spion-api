import { getDay } from '../../utils/date.js';
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
                            ),
                        1 
                    ) AS distance 
                FROM
                    pjp_schedule a
                    LEFT JOIN outlet b ON a.outlet_id = b.outlet_id 
                WHERE
                    DAY = ?
                    AND sales_force_id = ? 
                ) outlet_list
                LEFT JOIN (
                SELECT
                    * 
                FROM
                    pjp_check_in 
                WHERE
                    DATE( date ) = DATE(
                    NOW())
                    AND sf_id = ?
                ) check_in ON outlet_list.outlet_id = check_in.outlet_id
                LEFT JOIN (
                SELECT
                    * 
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
    




export default {
    getDayService,
    getOutletCheckInService,
}