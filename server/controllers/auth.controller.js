import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    try {
        const {fullName, email, password} = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Lütfen tüm alanları doldurunuz." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Şifreniz en az 6 karakter uzunluğunda olmalıdır." });
        }

        const user = await User.findOne({ email });

        if(user) {res.status(400).json({ message: "Kullanıcı zaten kayıtlı!"})};

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            fullName
        });

        if(newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
        });
        } else {
            res.status(400).json({ message: "Kayıt işleminde hata!" });
        }
        
    } catch (error) {
        console.error("Kayıt olma hatası: ", error);
        res.status(500).json({ message: "Server hatası!" });
    }
};

export const login = async (req,res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) { res.status(400).json("Kullanıcı bulunamadı!")};

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {res.status(400).json({message: "Hatalı şifre!"})};

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error({message: error});
        res.status(500).json({message: "Server Hatası!"});
    }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Başarıyla çıkış yapıldı" });
  } catch (error) {
    console.log("Çıkış sağlayıcıda hata!", error.message);
    res.status(500).json({ message: "Server Hatası!" });
  }
};

export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) { return res.status(400).json({message: "Profil fotoğrafı zorunludur!"})};

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
        
    } catch (error) {
        console.error("Profil güncellemede hata:",error);
        res.status(500).json({message: "Server hatası!"})
    }
}
