import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const userAuth = async (req, res, next) => {
  const {token}  = req.cookies;

  if (!token) {
    return res.json({ success: false, message: 'Not authorized, please login again' });
  }
  try {
    const tokenDecoded = jwt.verify(token, process.env.HASH_KEY);

    if (!tokenDecoded.id) {
      return res.json({ success: false, message: 'Not authorized, please login again' });
    }

    const userId = tokenDecoded.id;

    const sql = `SELECT id, name, email, role FROM "Users" WHERE id = $1 LIMIT 1`;
    const result = await pool.query(sql, [userId]);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    req.body.userId = userId;
    req.user = result.rows[0]; 

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
