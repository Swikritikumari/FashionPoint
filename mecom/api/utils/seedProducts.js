import Category from '../models/category.model.js';
import Product from '../models/product.model.js';

const starterProducts = [
    {
        category: "Women's Wear",
        name: 'White Floral Dress',
        description: 'A light, elegant white dress for everyday outings.',
        image: '/products/womenSW.jpeg',
        regularPrice: 1499,
        trending: true,
    },
    {
        category: "Women's Wear",
        name: 'High-Rise Blue Jeans',
        description: 'Versatile high-rise straight-leg denim jeans for everyday western outfits.',
        image: '/products/womens-jeans.png',
        regularPrice: 1899,
        trending: true,
    },
    {
        category: "Women's Wear",
        name: 'Lavender Puff-Sleeve Top',
        description: 'A soft pastel blouse with puff sleeves, easy to pair with jeans or skirts.',
        image: '/products/womens-top.png',
        regularPrice: 1199,
        trending: false,
    },
    {
        category: 'Sarees',
        name: 'Traditional Pink Saree',
        description: 'A colorful traditional saree for celebrations and special occasions.',
        image: '/products/saree.jpeg',
        regularPrice: 1999,
        trending: true,
    },
    {
        category: 'Sarees',
        name: 'Emerald Green Silk Saree',
        description: 'A rich emerald silk saree finished with a delicate gold border.',
        image: '/products/saree-green.png',
        regularPrice: 2799,
        trending: true,
    },
    {
        category: "Men's Wear",
        name: 'Blue Striped Casual Shirt',
        description: 'A short-sleeve striped shirt for a relaxed everyday look.',
        image: '/products/men-shirt.webp',
        regularPrice: 999,
        trending: false,
    },
    {
        category: "Men's Wear",
        name: 'Charcoal Casual Shirt',
        description: 'A versatile charcoal crew-neck shirt with a subtle textured finish.',
        image: '/products/mens-shirt.png',
        regularPrice: 1099,
        trending: false,
    },
    {
        category: 'Shoes',
        name: 'Brown Leather Loafers',
        description: 'Classic brown loafers with a comfortable fit for office and weekend wear.',
        image: '/products/mens-shoes.png',
        regularPrice: 2199,
        trending: false,
    },
    {
        category: 'Shoes',
        name: 'Everyday Runner Sneakers',
        description: 'Lightweight white and navy sneakers for everyday wear and casual runs.',
        image: '/products/shoes.png',
        regularPrice: 2499,
        trending: true,
    },
    {
        category: 'Watches',
        name: 'Classic Steel Wristwatch',
        description: 'A polished stainless steel watch with a refined navy dial and leather strap.',
        image: '/products/watch.png',
        regularPrice: 3299,
        trending: false,
    },
    {
        category: 'Watches',
        name: 'Black Sport Chronograph',
        description: 'A bold black chronograph-style watch with a durable silicone strap.',
        image: '/products/watch-sport.png',
        regularPrice: 2899,
        trending: true,
    },
    {
        category: 'Watches',
        name: 'Rose Gold Bracelet Watch',
        description: 'A refined rose gold watch with a blush dial and slim metal bracelet.',
        image: '/products/watch-rose.png',
        regularPrice: 3099,
        trending: false,
    },
    {
        category: 'Accessories',
        name: 'Sunglasses and Bracelet Set',
        description: 'A stylish tortoiseshell sunglasses and gold-tone bracelet pairing.',
        image: '/products/accessories.png',
        regularPrice: 1299,
        trending: true,
    },
    {
        category: 'Accessories',
        name: 'Tan Crossbody Handbag',
        description: 'A structured tan crossbody bag with a clean, everyday design.',
        image: '/products/handbag.png',
        regularPrice: 2199,
        trending: false,
    },
];

export async function seedStarterProducts() {
    let addedCount = 0;

    for (const starter of starterProducts) {
        const category = await Category.findOneAndUpdate(
            { name: starter.category },
            { $setOnInsert: { name: starter.category } },
            { new: true, upsert: true }
        );

        const existingProduct = await Product.findOne({ name: starter.name, categoryId: category._id });
        if (existingProduct) continue;

        await Product.create({
            userId: 'system',
            name: starter.name,
            description: starter.description,
            imageUrls: [starter.image],
            regularPrice: starter.regularPrice,
            discountPrice: starter.regularPrice,
            offer: false,
            trending: starter.trending,
            categoryId: category._id,
        });
        addedCount += 1;
    }

    if (addedCount) console.log(`Added ${addedCount} starter products to the catalog.`);
}
