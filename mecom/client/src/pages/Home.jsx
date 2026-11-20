import { useEffect, useState } from 'react';
import banner from '../assets/images/banner.jpg';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const res = await fetch('/api/product/getProducts');
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
        }
      }
      fetchProducts();
    } catch (error) {
      console.log(error.message);
    };
  }, [setProducts]);


  const getRandomOfferProducts = () => {
    const offerProducts = products.filter(product => product.offer);

    const shuffledProducts = offerProducts.sort(() => Math.random() - 0.5);

    return shuffledProducts.slice(0, 8);
  }

  const getRandomTrendingProducts = () => {
    const trendingProducts = products.filter(product => product.trending);

    const shuffledProducts = trendingProducts.sort(() => Math.random() - 0.5);

    return shuffledProducts.slice(0, 8);
  }

  const handleProductPage = (productId) => {
    navigate(`/product/${productId}`)
}

  return (
    <div>
      <div className='relative'>
        <img src={banner} alt="" className='h-[360px] w-full object-cover object-center sm:h-[440px] lg:h-[500px]'/>
        <div className='absolute inset-y-0 left-0 flex w-full items-center px-5 sm:justify-end sm:px-10 lg:px-16'>
          <div className='max-w-lg'>
          <p className='text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl'>Discover endless possibilities. <br/> Explore the future.</p>
            <Link to={'/products'}>
              <button className='bg-black text-white font-semibold px-5 py-2 rounded-md mt-6 hover:bg-gray-800'>View Products</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-2">
        <div className='text-center mt-10'>
          <h6 className='uppercase font-bold text-sm'>Top sale on this month</h6>
          <h1 className='text-3xl font-semibold mt-2 text-[#3d52a0] font-serif'>Trending Products</h1>
          <p className='text-sm text-slate-500 mt-3'>Unlock the latest trends. <br/> Elevate your lifestyle with our top-selling products of the month.</p>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4'>

          {getRandomTrendingProducts().map((product) => (

            <div key={product._id} className='min-w-0 w-full overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg' onClick={() => handleProductPage(product._id)}>
              <img src={product.imageUrls[0]} alt={product.name} loading='lazy' className='aspect-square w-full object-cover transition-transform duration-300 hover:scale-105'/>
              <div className='flex w-full flex-col gap-2 p-2 sm:p-3'>
                <h3 className='text-sm sm:text-lg font-semibold text-slate-700 line-clamp-1'>{product.name}</h3>
                <p className='text-xs sm:text-sm text-gray-600 line-clamp-2'>{product.description}</p>
                {product.offer ? (
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                    <p className='text-red-600 line-through text-sm'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                    <p className='text-green-600 font-semibold'>₹{product.discountPrice.toLocaleString('en-US')}</p>
                  </div>
                ) : (
                    <p className='font-semibold'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                )}
              </div>
            </div>
          ))} 
        </div>

        <div className='text-center mt-16 border-t pt-10'>
          <h6 className='uppercase font-bold text-sm'>Unbeatable deals awaits</h6>
          <h1 className='text-3xl font-semibold mt-2 text-[#3d52a0] font-serif'>Offer Products</h1>
          <p className='text-sm text-slate-500 mt-3'>Dive into our limited-time offers and elevate your shopping experience.</p>
        </div>
        <div className='mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4'>

          {getRandomOfferProducts().map((product) => (

            <div key={product._id} className='min-w-0 w-full overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg' onClick={() => handleProductPage(product._id)}>
              <img src={product.imageUrls[0]} alt={product.name} loading='lazy' className='aspect-square w-full object-cover transition-transform duration-300 hover:scale-105'/>
              <div className='flex w-full flex-col gap-2 p-2 sm:p-3'>
                <h3 className='text-sm sm:text-lg font-semibold text-slate-700 line-clamp-1'>{product.name}</h3>
                <p className='text-xs sm:text-sm text-gray-600 line-clamp-2'>{product.description}</p>
                {product.offer ? (
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                    <p className='text-red-600 line-through text-sm'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                    <p className='text-green-600 font-semibold'>₹{product.discountPrice.toLocaleString('en-US')}</p>
                  </div>
                ) : (
                    <p className='font-semibold'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                )}
              </div>
            </div>
          ))} 
        </div>
      </div>
      

    </div>
  )
}
