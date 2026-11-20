import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Navbar } from 'flowbite-react';
import { FaHeadphones, FaHome, FaShoppingCart, FaHeart, FaChevronDown, FaChevronUp, FaMoon, FaSun, FaBoxOpen, FaMapMarkerAlt } from "react-icons/fa";
import { MdAccountCircle, MdDashboardCustomize } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setCartItems } from '../redux/user/cartSlice';
import { deleteFailure, deleteStart, deleteSuccess, signOutSuccess } from '../redux/user/userSlice';
import { TiDeleteOutline } from 'react-icons/ti';
import { HiArrowSmRight } from 'react-icons/hi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function Header({ theme, onToggleTheme }) {

    const path = useLocation().pathname;
    const { currentUser } = useSelector((state) => state.user);
    
    const cartItems = useSelector((state) => state.cart.items) || []; 
    const [categories, setCategories] = useState([]);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/category/getCategory');
                const data = res.ok ? await res.json() : [];
                if (Array.isArray(data) && data.length) {
                    setCategories(data);
                    return;
                }

                // Recover category links from the product catalog if the category
                // endpoint returns an empty list, so existing products remain browsable.
                const productsRes = await fetch('/api/product/getProducts');
                if (!productsRes.ok) return;
                const products = await productsRes.json();
                const categoriesFromProducts = new Map();
                products.forEach((product) => {
                    const category = product.categoryId;
                    if (category?._id && category.name) categoriesFromProducts.set(category._id, category);
                });
                setCategories([...categoriesFromProducts.values()].sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCart = async () => {
          try {
            const res = await fetch(`/api/cart/${currentUser._id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success === false) {
              console.log(data.message);
              return;
            }
            if (res.ok) {
              dispatch(setCartItems(data.items) || []);
            }
          } catch (error) {
            console.log(error.message);
          }
        }
        if (currentUser) {
          fetchCart();
        }
    
      }, [currentUser, dispatch]);

      const handleSignOut = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your account!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sign out!',
                cancelButtonText: 'Cancel!'
              });
          
            if (result.isConfirmed) {
                const res = await fetch('/api/auth/signout', {
                    method: 'POST'
                });
        
                const data = await res.json();
                if (res.ok) {
                    dispatch(signOutSuccess(data));
                    toast.success('Sign out successful!');
                    navigate('/sign-in');
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const firstResult = await Swal.fire({
                title: 'Are you sure?',
                text: 'Your account will be deleted!',
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, Delete it!',
                cancelButtonText: 'Cancel!'
            });
            if (firstResult.isConfirmed) {
                const secondResult = await Swal.fire({
                    title: 'Type "YES" to confirm',
                    input: 'text',
                    inputPlaceholder: 'Type "YES"',
                    inputAttributes: { autocomplete: 'off' },
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel!',
                    preConfirm: (inputValue) => {
                        if (inputValue.toLowerCase() !== 'yes') {
                            Swal.showValidationMessage('You need to type "YES" to confirm');
                        }
                    }
                });
    
                if (secondResult.isConfirmed && secondResult.value === 'yes') {
                    dispatch(deleteStart());
                    const res = await fetch(`/api/user/deleteUser/${currentUser._id}`, {
                        method: 'DELETE'
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        dispatch(deleteFailure(data.message));
                        toast.error(data.message);
                        return;
                    } else {
                        dispatch(deleteSuccess(data));
                        toast.success('Account has been deleted!');
                        navigate('/sign-in');
                    }
                }
            }
        } catch (error) {
            dispatch(deleteFailure(error.message));
            toast.error(error.message);
        }
    };

  return (
    
    <Navbar className={`border-b-2 shadow-sm text-black ${theme === 'dark' ? 'bg-[#1e3a8a]' : 'bg-[#3d52a0]'}`}>
        <Link to='/' className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold '>
            <span className='font-bold text-black text-xl'>Fashion Point</span>
        </Link>

        <Link to='/cart' className='md:hidden'>
            <button className='flex items-center gap-1'>
            <span className='hover:text-[#3d52a0]'><FaShoppingCart /></span> 

            <span className='bg-red-500 rounded-full w-5 h-5 text-center text-white text-sm'>
                {currentUser && !cartItems.length ? 0 : cartItems.length } 
            </span>
            </button>
        </Link>

        <div className="flex gap-2 md:order-2">
            {currentUser ? (
                <Dropdown 
                arrowIcon={true} 
                inline
                label={ <MdAccountCircle className='text-3xl text-black'/> }>
                    <Dropdown.Header>
                        <span className='block text-sm font-medium truncate'>{currentUser.email}</span>
                    </Dropdown.Header>
                    {currentUser.isAdmin && (
                        <Link to={'/dashboard?tab=productLists'}>
                            <Dropdown.Item icon={MdDashboardCustomize} className='text-blue-500 font-semibold'>
                                Dashboard
                            </Dropdown.Item>
                        </Link>
                    )}
                    {!currentUser.isAdmin && (
                        <Link to={'/admin/sign-in'}>
                            <Dropdown.Item icon={MdDashboardCustomize} className='text-blue-500 font-semibold'>
                                Admin sign in
                            </Dropdown.Item>
                        </Link>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Header>
                        <span className='block text-xs font-semibold uppercase tracking-wider text-slate-500'>Settings</span>
                    </Dropdown.Header>
                    <Link to='/address'>
                        <Dropdown.Item icon={FaMapMarkerAlt}>My Address</Dropdown.Item>
                    </Link>
                    <Link to='/orders'>
                        <Dropdown.Item icon={FaBoxOpen}>My Orders</Dropdown.Item>
                    </Link>
                    <Link to='/wishlist'>
                        <Dropdown.Item icon={FaHeart}>My Wishlist</Dropdown.Item>
                    </Link>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleSignOut} icon={HiArrowSmRight} className='text-green-600 font-semibold'>
                        Log out
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDelete} icon={TiDeleteOutline} className='text-red-500 font-semibold'>
                        Delete account
                    </Dropdown.Item>
                </Dropdown>
            ) : (
                <div className='flex items-center gap-2'>
                    <Link to='/sign-in'>
                        <button className='rounded-lg bg-[#3d52a0] px-3 py-2 text-md text-white hover:bg-[#4f62aa]'>Sign In</button>
                    </Link>
                    <Link to='/admin/sign-in' className='hidden sm:block'>
                        <button className='rounded-lg border border-[#3d52a0] px-3 py-2 text-sm font-semibold text-[#3d52a0] hover:bg-blue-50'>Admin</button>
                    </Link>
                </div>
            )}
            <button
                type='button'
                onClick={onToggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className='flex h-10 w-10 items-center justify-center rounded-full text-lg text-black hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200'
            >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            <Navbar.Toggle/>
        </div>

        <Navbar.Collapse>
            <Link to='/'>
                <Navbar.Link 
                    as={'div'} 
                    className={`text-black ${path === '/'  ? 'bg-blue-300' : '' }`} 
                    active={path === '/'} 
                >
                <span className='flex items-center gap-1 text-[16px] text-black'><FaHome /> Home</span>
                </Navbar.Link>
            </Link>

            <Link to='/products'>
                <Navbar.Link as={'div'} className={`text-black ${path === '/products'  ? 'bg-blue-300' : '' }`} active={path === '/products'}>
                <span className='flex items-center gap-1 text-[16px] text-black'><FaHeadphones /> Products</span>
                </Navbar.Link>
            </Link>

            <div className='relative w-full md:w-auto'>
                <button
                    type='button'
                    aria-expanded={categoriesOpen}
                    aria-controls='navbar-category-options'
                    onClick={() => setCategoriesOpen((open) => !open)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[16px] text-black hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-auto ${path.startsWith('/categoryProducts/') ? 'bg-blue-300' : ''}`}
                >
                    Categories {categoriesOpen ? <FaChevronUp className='text-xs' /> : <FaChevronDown className='text-xs' />}
                </button>
                {categoriesOpen && (
                    <div id='navbar-category-options' className='relative z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg md:absolute md:left-0 md:top-full md:mt-0 md:min-w-52'>
                        {categories.length ? categories.map((category) => (
                            <Link
                                key={category._id}
                                to={`/categoryProducts/${category._id}`}
                                onClick={() => setCategoriesOpen(false)}
                                className='block px-4 py-2 text-sm text-black hover:bg-blue-100 focus:bg-blue-100 focus:outline-none'
                            >
                                {category.name}
                            </Link>
                        )) : <span className='block px-4 py-2 text-sm text-slate-500'>No categories available</span>}
                    </div>
                )}
            </div>

            <Link to='/wishlist'>
                <Navbar.Link as={'div'} className={`text-black ${path === '/wishlist' ? 'bg-blue-300' : ''}`} active={path === '/wishlist'}>
                    <span className='flex items-center gap-1 text-[16px] text-black'><FaHeart className='text-rose-500' /> Wishlist</span>
                </Navbar.Link>
            </Link>

            {currentUser && <Link to='/orders'>
                <Navbar.Link as={'div'} className={`text-black ${path === '/orders' ? 'bg-blue-300' : ''}`} active={path === '/orders'}>
                    <span className='flex items-center gap-1 text-[16px] text-black'><FaBoxOpen /> My Order</span>
                </Navbar.Link>
            </Link>}


            <Link to='/cart' className='hidden md:block'>
                <Navbar.Link 
                    as={'div'} 
                    className={`text-[16px] flex items-center gap-1 text-black ${path === '/cart'  ? 'bg-blue-300' : '' }`} 
                    active={path === '/cart'}
                >
                <span className='flex items-center gap-1 text-black'><FaShoppingCart />Cart</span> 

                <span className='bg-red-500 rounded-full w-5 h-5 text-center text-white text-sm'>
                   {currentUser && !cartItems.length ? 0 : cartItems.length } 
                   
                </span>
                </Navbar.Link>
            </Link>

        </Navbar.Collapse>

    </Navbar>
  )
}
