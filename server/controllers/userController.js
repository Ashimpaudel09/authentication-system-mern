import userModel from '../models/userModel.js'

export const getUserData = async(req, res)=>{
    try {
        const { userId } = req.user;
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User Not Found" })
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                status: user.isVerified,
                email: user.email
            }
        })
    }
    catch(error){
        return response.json({success: false, message: error.message})
    }
}