import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import crypto from 'crypto'
export const register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        if (password !== confirmPassword) {
            return res.json({ success: false, message: 'Password and Confirm password must be same' });
        }
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: 'User Already exists' });

        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({ name, email, password: hashedPassword })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 60 * 1000
        })

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to User Authentication project',
            text: `welcome to user authentication project created by ashim paudel `
        }
        await transporter.sendMail(mailOptions)

        return res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email, !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }

    try {
        const existingUser = await userModel.findOne({ email })
        if (!existingUser) {
            res.json({ success: false, message: 'user doesnot exists' })

        }
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            res.json({ success: false, message: 'Invalid Password' })
        }
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 60 * 1000
        })
        return res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: 'Logged Out' })
    }

    catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await userModel.findById(userId);
        if (user.isVerified) {
            return res.json({ success: false, message: "Account Already Verified" })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000

        await user.save()
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification Otp',
            text: `your OTP is ${otp}. Verify your account using this OTP`
        }
        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: 'Otp sent succesfully' })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { userId } = req.user;
    const { otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details' })

    }
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (user.isVerified) {
            return res.json({ success: false, message: 'User is Already Verified' })
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid Otp' })
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Otp Expired' })
        }
        user.isVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0;
        await user.save()
        return res.json({ success: true, message: 'Email Verified successfully' })

    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const forgetPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Missing Detail' })
    }
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
        return res.json({ success: false, message: 'User not found' })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    existingUser.resetOtp = otp
    existingUser.resetOtpExpiredAt = Date.now() + 5 * 60 * 1000

    await existingUser.save()

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: existingUser.email,
        subject: 'Password Reset Otp',
        text: `your OTP is ${otp}. Reset your password using this OTP. OTP expires in 5 minutes`
    }
    await transporter.sendMail(mailOptions)
    return res.json({ success: true, message: 'Otp sent to your email' })
}

export const forgetPasswordVerification = async (req, res) => {
    const { email, otp } = req.body;
    if (!otp || !email) {
        return res.json({ success: false, message: 'Missing Detail' })
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'Invalid Otp' })
        }
        if (user.resetOtpExpiredAt < Date.now()) {
            return res.json({ success: false, message: 'Otp Expired' })
        }
        if (user.resetOtp != otp) {
            return res.json({ success: false, message: 'Invalid Otp' })
        }
        const jti = crypto.randomUUID();
        const resetToken = jwt.sign({
            sub: user._id,
            purpose: "password_reset",
            jti
        }, process.env.JWT_SECRET,
            { expiresIn: '15m' })
        user.resetJti = jti
        user.resetOtp = ''
        user.resetOtpExpiredAt = 0,
            await user.save()
        return res.json({ success: true, resetToken })

    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword) {
        return res.json({ success: false, message: "Missing Detail" })

    }
    if(newPassword!==confirmPassword){
                return res.json({ success: false, message: "New password and Confirm new password must be same" })
    }
    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
    }
    catch {
        return res.json({ success: false, message: "Invalid Token or Expired" })
    }
    if (decoded.purpose !== "password_reset" || !decoded.sub || !decoded.jti) {
        res.json({ success: false, message: "Invalid token" })
    }
    const user = await userModel.findById(decoded.sub)
    if (!user || user.resetJti !== decoded.jti) {
        return res.json({ success: false, message: "Token already or invalid" })
    }
    const compare = await bcrypt.compare(newPassword, user.password)
    if (compare) {
        return res.json({ success: false, message: "New and Old password doesnot matched" })
    }
   const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetJti = "";
    await user.save()
    return res.json({ success: true, message: "Password updated" });

}