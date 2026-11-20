import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'
import { isConfiguredAdminEmail, promoteConfiguredAdmin } from '../utils/adminAccess.js';

const authCookieBaseOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
};

const authCookieOptions = () => ({ ...authCookieBaseOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });


export const signUp = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password || email === '' || password === '') {
            return next(errorHandler(400, 'All fields are required'));
        }
        if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)) {
            return next(errorHandler(400, 'Use a Gmail address ending with @gmail.com'));
        }

        if (isConfiguredAdminEmail(email)) {
            const existingAdminAccount = await User.findOne({ email: { $regex: `^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
            if (!existingAdminAccount) return next(errorHandler(403, 'Create this account through the configured admin sign-in provider'));
        }
    
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save()
    
        const {password: pass, ...rest} = newUser._doc;
    
        res.status(200).json(rest)
        
    } catch (error) {
        if (error.code === 11000) {
            next(errorHandler(403, 'Email already exists!'))
        } else {
            next(error)
        }
    }
};


export const signIn = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password || email === '' || password === '') {
            return next(errorHandler(400, 'All fields are required!'));
        }

        // Case-insensitive lookup also supports accounts created before email
        // addresses were normalized to lowercase during registration.
        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const validUser = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
        if (!validUser) 
            return next(errorHandler(404, 'User not found!'));
        

        const validPassword = bcryptjs.compareSync(password, validUser.password)
        if (!validPassword) 
            return next(errorHandler(404, 'Invalid password!'))

        await promoteConfiguredAdmin(validUser);
        
        const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const {password: pass, ...rest} = validUser._doc;
        res.cookie('access_token', token, authCookieOptions()).status(200).json(rest);

    } catch (error) {
        next(error)
    }
};

export const getSession = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return next(errorHandler(401, 'Your session has expired. Please sign in again.'));
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};


export const google = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)) {
            return next(errorHandler(400, 'Use a Gmail address ending with @gmail.com'));
        }
        const user = await User.findOne({ email });
        if (user) {
            await promoteConfiguredAdmin(user);
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { password: pass, ...rest } = user._doc;
            res.cookie('access_token', token, authCookieOptions()).status(200).json(rest)

        } else {
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
            const newUser = new User({ 
                email: req.body.email, 
                password: hashedPassword 
            });

            await newUser.save();
            await promoteConfiguredAdmin(newUser);
            
            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const {password: pass, ...rest} = newUser._doc;
            res.cookie('access_token', token, authCookieOptions()).status(200).json(rest);
        }
    } catch (error) {
        next(error)
    }
};


export const signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token', authCookieBaseOptions)
            .status(200).json('User sign out successfully!');
    } catch (error) {
        next(error)
    }
};
