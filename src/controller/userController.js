import pool from "../config/db.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodeMailer.js";


export const userRegister = async (req,res) => {
    const {name,username, email, password, avater} = req.body
    const role = "USER"
    if(!name || !email || !password) {
        return res.json({success: false, message: 'Missing Detail'})
    }
    if(role == 'ADMIN'){
        return res.json({success: false, message: 'sorry you cant be an admin'})
    }
    try{
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql_query_email_validate = `
            SELECT * FROM "Users" WHERE email = $1 LIMIT 1
        `
        const existedUser =await pool.query(sql_query_email_validate, [email])
        if(existedUser.rows.length > 0){
            return res.json({success: false, message: 'Email already existes'})
        }
        const sql_query_reg = `
            INSERT INTO "Users" (name, username, password, avater, email, role)
            VALUES($1, $2, $3, $4, $5 , $6)
            RETURNING id, email;
        `
        const newUser = await pool.query(sql_query_reg, [name, username, hashedPassword, avater,email ,role ])

        const id = newUser.rows[0].id
        const userEmail = newUser.rows[0].email

        //responding with cookie token of id
        const token = jwt.sign({id: id}, process.env.HASH_KEY, {expiresIn: '7d'})
            res.cookie('token',token, {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7* 24 * 60 * 60 * 1000
        })

        //sending welcome email

        const mailOption = ({
            from: process.env.EMAIL,
            to: email,
            subject: 'Welcome to E_learn',
            text: `Welcome to E_learn.Hello ${name} Your account is created with email id: ${email}`
        })
        await transporter.sendMail(mailOption)
        res.json({success: true, message: 'User registered'})
    } catch(error){
        res.json({success: false, message: error.message})
    }
}
export const userLogin = async (req,res) => {
    const {email, password} = req.body
    if(!email || !password) {
        return res.json({success: false, message: 'Missing Detail'})
    }
    try{
        const sql_query_email_validate = `
            SELECT * FROM "Users" WHERE email = $1 LIMIT 1
        `
        const existedUser =await pool.query(sql_query_email_validate, [email])
        const { email: userEmail, password: userPassword, id: id } = existedUser.rows[0];
        if(existedUser.rows.length === 0){
            return res.json({success: false, message: 'User not found'})
        }
        const isMatch = await bcrypt.compare(password, userPassword)
        if(!isMatch){
            return res.json({success: false, message: 'Invalid credentials'})
        }
        const token = jwt.sign({id: id}, process.env.HASH_KEY, {expiresIn: '7d'})
        res.cookie('token',token, {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7* 24 * 60 * 60 * 1000
        })
        res.json({success: true})
        } catch(error){
            return res.json({success: false, message: error.message})   
        }
}
export const logout = async(req, res) =>{
  try{
    res.clearCookie('token', {
      httpOnly : true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',   
    })
    res.json({success: true, message: 'Logged out successfully'})
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}
export const sendVerifyOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    const sql = `SELECT * FROM "Users" WHERE id = $1 LIMIT 1`;
    const result = await pool.query(sql, [userId]);
    const User = result.rows[0];

    if (!User) {
      return res.json({ success: false, message: "User not found" });
    }

    if (User.isaccverified) {  
      return res.json({ success: false, message: "Account already verified" });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    const OTPExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    const updateSql = `
      UPDATE "Users"
      SET "verifyOTP" = $1, "OTPExpireAt" = $2
      WHERE id = $3
    `;
    await pool.query(updateSql, [OTP, OTPExpireAt, userId]);

    const mailOption = {
      from: process.env.EMAIL,
      to: User.email,
      subject: "Account verification OTP",
      text: `Your OTP is ${OTP}, verify your account with this OTP`,
    };
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
