import { Table } from "flowbite-react";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { TiMinus, TiPlus } from "react-icons/ti";
import { FaBolt } from "react-icons/fa";
import getProductSizes from '../utils/getProductSizes.js';

export default function CartCard({ item, onDelete, onIncrement, onDecrement, onSizeChange }) {

    const navigate = useNavigate();

    const handleProductPage = () => {
        if (item.productId?._id) navigate(`/product/${item.productId._id}`)
    }

    const handleBuyNow = (event) => {
        event.stopPropagation();
        if (availableSizes.length && !item.size) return;
        if (item.productId?._id) navigate(`/checkout/${item.productId._id}${item.size ? `?size=${encodeURIComponent(item.size)}` : ''}`);
    }

    const imageUrl = item.productId?.imageUrls?.[0] || '/placeholder.jpg'; 
    const productName = item.productId?.name || 'Product Unavailable';
    const regularPrice = item.productId?.regularPrice || 0;
    const availableSizes = getProductSizes(item.productId);

  return (
    
        <Table.Row className='cursor-pointer' key={item._id}>
            <Table.Cell className='ps-3' onClick={handleProductPage}>
                <img src={imageUrl} alt="" className='w-16 h-16 object-cover bg-gray-500' />
            </Table.Cell>
            <Table.Cell className='whitespace-nowrap text-sm' style={{ maxWidth: '200px' }} onClick={handleProductPage}>
            <div className='truncate'>
                {productName}
            </div>
        </Table.Cell>
            <Table.Cell className='whitespace-nowrap text-sm'>
                {availableSizes.length ? (
                    <select aria-label={`Size for ${productName}`} value={item.size || ''} onChange={(event) => onSizeChange(item._id, event.target.value)} className='rounded border border-slate-300 bg-white p-1.5'>
                        <option value=''>Select size</option>
                        {availableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                ) : <span>—</span>}
            </Table.Cell>
            <Table.Cell className='text-sm'>
                <div className='flex items-center gap-3'>
                    <button className='text-lg' onClick={() => onDecrement(item._id, item.quantity)}><TiMinus /></button>
                    <span className='font-semibold'>{item.quantity}</span>
                    <button className='text-lg' onClick={() => onIncrement(item._id, item.quantity)}><TiPlus/></button>
                </div>
            </Table.Cell>
            <Table.Cell className='whitespace-nowrap text-sm' onClick={handleProductPage}>
                ₹ {regularPrice.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
                <button type="button" disabled={!item.productId?._id || (availableSizes.length > 0 && !item.size)} onClick={handleBuyNow} className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-[#3d52a0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4f62aa] disabled:cursor-not-allowed disabled:opacity-50">
                    <FaBolt /> Buy Now
                </button>
            </Table.Cell>
            <Table.Cell className='whitespace-nowrap text-lg text-red-600' onClick={() => onDelete(item._id)}>
                <RiDeleteBin5Fill className="cursor-pointer"/>
            </Table.Cell>
        </Table.Row>
    
  );
}
