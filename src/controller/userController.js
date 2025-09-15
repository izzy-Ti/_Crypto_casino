import pool from "../config/db.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodeMailer.js";


export const userRegister = async (req,res) => {
    const {name,username, email, password, avater} = req.body
    const role = "USER"
    if(!name || !email || !password || !username) {
        return res.json({success: false, message: 'Missing Detail'})
    }
    if(role == 'ADMIN'){
        return res.json({success: false, message: 'sorry you cant be an admin'})
    }
    try{
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql_query_email_validate = `
            SELECT * FROM "Users" WHERE email = $1 LIMIT 1;
        `
        const sql_username = `
          SELECT * FROM "Users" WHERE username = $1 LIMIT 1;
        `
        const userNaem =await pool.query(sql_username, [username]);
        const existedUser =await pool.query(sql_query_email_validate, [email])
        if(existedUser.rows.length > 0 ){
            return res.json({success: false, message: 'Email already existes'})
        }
        if(userNaem.rows.length > 0){
            return res.json({success: false, message: 'Username already existes'})
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
               subject: 'Welcome to E_Casino!',
              html: `
                  <div style="font-family: 'Arial', sans-serif; background-color: #121212; color: #fff; padding: 20px; border-radius: 8px;">
                      <div style="text-align: center;">
                          <h1 style="color: #FFD700;">🎉 Welcome to E_Casino, ${name} 🎉</h1>
                          <p style="font-size: 16px; color: #aaa;">We're thrilled to have you join the E_Casino community!</p>
                      </div>
                      <div style="background-color: #333; padding: 20px; border-radius: 8px;">
                          <p style="font-size: 18px; color: #fff;">Your account has been successfully created with the following details:</p>
                          <table style="width: 100%; margin-top: 10px; color: #fff;">
                              <tr>
                                  <td style="padding: 8px; font-weight: bold;">Name:</td>
                                  <td style="padding: 8px;">${name}</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px; font-weight: bold;">Email:</td>
                                  <td style="padding: 8px;">${email}</td>
                              </tr>
                          </table>
                          <p style="font-size: 16px; margin-top: 15px;">Feel free to explore and enjoy our wide variety of casino games!</p>
                          <div style="text-align: center; margin-top: 20px;">
                              <a href="https://www.e-casino.com" style="background-color: #FFD700; color: #121212; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">Start Playing Now</a>
                          </div>
                      </div>
                      <p style="text-align: center; color: #777; margin-top: 30px;">If you have any questions, feel free to <a href="mailto:support@e-casino.com" style="color: #FFD700;">contact us</a>.</p>
                      <p style="text-align: center; font-size: 14px; color: #444;">&copy; 2025 E_Casino - All Rights Reserved</p>
                  </div>
              `
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
      subject: "🔐 Verify Your Account - OTP Code",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px solid #eee;">
            <div style="text-align: center; padding: 10px 0;">
              <h1 style="color: #4A90E2;">Welcome to CryptoCasino 🎰</h1>
              <p style="color: #555;">We’re excited to have you! Please verify your account using the OTP below:</p>
            </div>

            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 15px;">Your OTP Code</h2>
              <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #4A90E2; margin: 20px 0;">
                ${OTP}
              </div>
              <p style="color: #888;">This OTP will expire in <b>24 hours</b>.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #777;">
              <p>If you didn’t request this, you can safely ignore this email.</p>
              <p style="font-size: 14px;">© ${new Date().getFullYear()} CryptoCasino. All rights reserved.</p>
            </div>
          </div>
          `
    };
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const verifyOTP = async (req,res) =>{
  const {otp, userId} = req.body
  if(!userId || !otp){
    return res.json({success: false, message: 'Missing details'})     
  }
  try{
    const sql = `
      SELECT * FROM "Users" WHERE id = $1 LIMIT 1;
    `
    const result = await pool.query(sql, [userId])
    const User = result.rows[0];
    if(!User) {
      return res.json({success: false, message: 'User not found'})     
    }
    if(User.verifyOTP === '' || User.verifyOTP !== otp){
      return res.json({success: false, message: 'Verification faild'})     
    }
    if(User.OTPExpireAt < Date.now()){
      return res.json({success: false, message: 'OTP Expired'})     
    }

    const sql_update = `
      UPDATE "Users"
      SET "IsAccVerified" = $1,
      "verifyOTP" = $2,
      "OTPExpireAt" = $3
      WHERE id = $4
    `
    await pool.query(sql_update, [true, '', 0, userId])
    res.json({success: true, message: 'Verification OTP verified successfully'})
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}
export const isAuth = async (req,res ) =>{
    try{
    return res.json({success: true})     
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}
export const sendResetOTP = async (req,res) =>{
  const {email} = req.body
  if(!email){
    res.json({success: false, message: 'Missing details'})
  } 
  try{
    const sql = `
      SELECT * FROM "Users" WHERE email = $1 LIMIT 1;
    ` 
    const result = await pool.query(sql, [email])
    const User = result.rows[0];
    if(!User){
      return res.json({success: false, message: 'User not found'})     
     }
    const OTP = String(Math.floor(100000 + Math.random() * 900000))
    const ResetOTPExpireAt = Date.now() + 15 * 60 * 1000
    const sql_update = `
     UPDATE "Users" 
     SET "ResetOTP" = $1,
      "ResetOTPExpireAt" = $2
 
     WHERE email = $3
    ` 
    await pool.query(sql_update,[ OTP, ResetOTPExpireAt, email])
    const mailOption = ({
        from: process.env.EMAIL,
        to: User.email,
        subject: 'Password reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px solid #eee;">
            <div style="text-align: center; padding: 10px 0;">
              <h1 style="color: #4A90E2;">Welcome to CryptoCasino 🎰</h1>
              <p style="color: #555;">We’re excited to have you! Please verify your account using the OTP below:</p>
            </div>

            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 15px;">Your OTP Code</h2>
              <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #4A90E2; margin: 20px 0;">
                ${OTP}
              </div>
              <p style="color: #888;">This OTP will expire in <b>24 hours</b>.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #777;">
              <p>If you didn’t request this, you can safely ignore this email.</p>
              <p style="font-size: 14px;">© ${new Date().getFullYear()} CryptoCasino. All rights reserved.</p>
            </div>
          </div>
          `
      })
    await transporter.sendMail(mailOption)
    res.json({success: true, message: 'OTP sent to your email'})
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}
export const resetPassword = async (req,res) =>{
  const {email, otp, newPassword} = req.body
  if(!email || !otp || !newPassword){
    res.json({success: false, message: 'Missing details'})
  }
  try{

    const sql = `
      SELECT * FROM "Users" WHERE email = $1 LIMIT 1;
    ` 
    const result = await pool.query(sql, [email])
    const User = result.rows[0];

    if(!User){
      return res.json({success: false, message: 'User not found'})     
    }
    if(User.ResetOTP == '' || User.ResetOTP !== otp){
      return res.json({success: false, message: 'Invalid OTP number'})     
    }
    if(User.ResetOTPExpireAt < Date.now()){
      return res.json({success: false, message: 'OTP is Expired'})     
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const sql_update = `
      UPDATE "Users"
      SET "password" = $1,
      "ResetOTP" = $2,
      "ResetOTPExpireAt" = $3

      WHERE email = $4
    `
    await pool.query(sql_update, [hashedPassword, '', 0, email])
    return res.json({success: true, message: 'Password has been reseted successfully'})     
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}
export const getUserData = async (req,res) =>{
  try{
    const {userId} = req.body
    const sql = `SELECT * FROM "Users" WHERE id = $1 LIMIT 1`;
    const result = await pool.query(sql, [userId]);
    const User = result.rows[0];

    if(!User){
      return res.json({success: false, message: 'User not found'})     
    }
    return res.json({success: true,
      userData: {
        name: User.name,
        email: User.email,
        IsAccVerified: User.IsAccVerified,
      }})     
  }catch(error){
    return res.json({success: false, message: error.message})     
  }
}