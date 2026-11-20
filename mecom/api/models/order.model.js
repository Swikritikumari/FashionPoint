import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    size: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    status: { type: String, enum: ['placed', 'cancelled'], default: 'placed' }
  }],
  total: { type: Number, required: true },
  shipping: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['cash_on_delivery', 'upi', 'pay_later'], default: 'cash_on_delivery' },
  upiPlatform: { type: String, enum: ['phonepe', 'google_pay', 'paytm', 'bhim', 'amazon_pay', 'other'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['placed', 'cancelled', 'fulfilled'], default: 'placed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
