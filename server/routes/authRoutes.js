import express from 'express'
import { forgetPassword, login, logout, register, resetPassword, sendVerifyOtp, verifyEmail, forgetPasswordVerification } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

 const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-otp', userAuth, verifyEmail)
authRouter.post('/send-reset-otp', forgetPassword)
authRouter.post('/verify-reset-otp', forgetPasswordVerification)
authRouter.post('/reset-password', resetPassword)
export default authRouter;