import pool from "../../helpers/db.js";
import { getDay } from '../../utils/date.js';

const getPJPDuration = async (req, res) => {
    const { user } = req;
    const day = getDay(new Date());
    
    const query = `SELECT
                    ROUND(270/COUNT(OUTLET_ID),0) AS pjp_duration
                    FROM
                    pjp_schedule
                    WHERE
                    sales_force_id = ? AND
                    day = ?`;
    const params = [user.sales_force_id, day];
    try {
        const result = await pool.query(query, params);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

export default {
    getPJPDuration,
}