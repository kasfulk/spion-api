import pool from "../../helpers/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const login = async (username, password, res) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    const [result,field] = await pool.query(query,[username,password]);
    if (result.length > 0) {
        const bcryptCompare = await bcrypt.compare(password, result[0].password);
        if (bcryptCompare) {
            const token = jwt.sign({
                id: result[0].id,
                username: result[0].username,
                email: result[0].email,
                role: result[0].role
            }, process.env.JWT_SECRET, { expiresIn: '9h' });
            res.status(200).json({
                message: 'Login Success',
                token: token
            });
        } else {
            res.status(401).json({
                message: 'Wrong Password'
            });
        }
    } else {
        res.status(401).send({
            message: "gagal",
        });
    }
};

const getUser = async (req, res) => {
    const { user } = req;
    const query = `SELECT username,role,name FROM users WHERE id = ?`;
    const [result,field] = await pool.query(query,[user.id]);
    res.status(200).json({
        message: 'Get User Success',
        result: result[0]
    });
};

export default {
    login,
    getUser,
}