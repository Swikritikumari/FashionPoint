import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
import categoryRouter from './routes/category.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { seedStarterProducts } from './utils/seedProducts.js';
import { ensureConfiguredAdminAccount } from './utils/adminAccess.js';

dotenv.config();

const __dirname = path.resolve();

const app = express();

app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

app.use('/uploads', express.static(path.join(__dirname, 'client', 'uploads')));
app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Invalid server error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDb');
        await ensureConfiguredAdminAccount();
        await seedStarterProducts();
        app.listen(3000, () => {
            console.log('Server connected to port 3000!');
        });
    } catch (error) {
        console.error('Could not start the server:', error.message);
        process.exit(1);
    }
};

startServer();
