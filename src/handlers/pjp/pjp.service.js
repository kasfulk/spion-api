import pool from "../../helpers/db.js";
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
        const [result,metadata] = await pool.query(query, params);
        res.status(200).json(result[0].map(({ pjp_duration, total_outlets }) => {
            return {
                pjp_duration: Number(pjp_duration),
                total_outlets
            }
        }));
    }
    catch (err) {
        res.status(500).json(err);
    }
}

export default {
    getPJPDuration,
}