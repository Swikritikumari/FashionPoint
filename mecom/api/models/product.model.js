import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrls: {
        type: Array,
        required: true,
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        required: true,
    },
    offer: {
        type: Boolean,
        required: true,
    },
    trending: {
        type: Boolean,
        required: true,
    },
    sizes: {
        type: [String],
        default: []
    },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        value: { type: Number, min: 1, max: 5, required: true }
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
