import pool from "../config/db.js";
import Stripe from "stripe";
import transporter from "../config/nodeMailer.js";

const stripe = new Stripe(process.env.STRIPE_KEY);


export const createTransaction = async (req,res) =>{
    const {userId} = req.body
    const price = parseInt(req.body.price, 10);
    try{
        const sql = `
            SELECT * FROM "Users" WHERE id = $1 LIMIT 1;
        `
        const result = await pool.query(sql, [userId])
        const User = result.rows[0];
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price*100,
            currency: 'usd',
        });
        if (!User) {
            return res.json({ success: false, message: "User not found" });
        }

        if (User.isaccverified) {  
            return res.json({ success: false, message: "Account already verified" });
        }
        const userBalance = User.balance + price;
        const sql_update = `
            UPDATE "Users"
            SET balance = $1
            WHERE id = $2
        `
        await pool.query(sql_update, [userBalance, userId])
        const sql_transac = `
            INSERT INTO "transactions" (user_id, type, amount, currency) 
            VALUES($1,$2,$3,$4)
        `
        await pool.query(sql_transac, [userId, 'deposit', price*100, 'usd'])
        const mailOption = ({
                from: process.env.EMAIL,
                to: User.email,
                subject: 'Deposit Confirmation - E_Casino',
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center;">
                                <h2 style="color: #FFD700;">Deposit Successful!</h2>
                                <p>Hello, ${User.name}!</p>
                               <p>Your deposit of <strong>$${price.toFixed(2)} ${User.currency}</strong> has been successfully processed.</p>

                                <p>Transaction ID: <strong>${User.transactionId}</strong></p>
                            </div>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="https://www.e-casino.com/dashboard" style="background-color: #FFD700; color: #121212; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                            </div>
                            <p style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">If you have any issues, contact us at <a href="mailto:support@e-casino.com" style="color: #FFD700;">support@e-casino.com</a></p>
                        </div>
                    </div>
                `
        })
        await transporter.sendMail(mailOption)
        res.json({success: true, message: `Deposite of ${price} is successfull`})
    }catch(error){
        return res.json({success: false, message: error.message})     
    }
}