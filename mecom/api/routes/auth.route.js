import express from 'express';
import { signUp, signIn, google, signout, getSession } from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/session', verifyToken, getSession);
router.post('/google', google);
router.post('/signout', signout);

export default router;
