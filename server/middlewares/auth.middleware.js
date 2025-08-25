import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({message: "Token bulunamadı. İzinsiz giriş denemesi!"})
        };

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded) {
            return res.status(401).json({message: "Geçersiz token!"})
        };

        const user = await User.findById(decoded.userId).select("-password"); // şifre alanını dışarıda tutuyoruz güvenlik için
         if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
        }
        req.user = user;
        next();

    } catch (error) {
        console.log("protectRoute middleware'inde hata: ", error.message);
        res.status(500).json({ message: "Server hatası!" });
    }
}