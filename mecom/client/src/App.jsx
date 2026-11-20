import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import Header from './components/Header';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Product from './pages/Product';
import Footer from './components/Footer';
import CategoryProduct from './pages/CategoryProduct';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import AdminSignIn from './pages/AdminSignIn';
import MyAddress from './pages/MyAddress';
import { ToastContainer } from 'react-toastify';
import { signInSuccess, signOutSuccess } from './redux/user/userSlice';


export default function App() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [theme, setTheme] = useState(() => localStorage.getItem('mecom-theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('mecom-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;

    const controller = new AbortController();
    fetch('/api/auth/session', { credentials: 'include', signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Your session has expired. Please sign in again.');
        dispatch(signInSuccess(await res.json()));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') dispatch(signOutSuccess());
      });

    return () => controller.abort();
  }, [currentUser?._id, dispatch]);

  return (
    
    <BrowserRouter>

      <Header theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />

      <Routes>
        <Route path='/' element={<Home />}></Route>

        <Route path='/sign-in' element={<SignIn />}></Route>

        <Route path='/admin/sign-in' element={<AdminSignIn />}></Route>

        <Route path='/sign-up' element={<SignUp />}></Route>
        
        <Route path='/products' element={<Products />}></Route>

        <Route path='/cart' element={<Cart />}></Route>

        <Route path='/wishlist' element={<Wishlist />}></Route>

        <Route element={<PrivateRoute />}>
          <Route path='/address' element={<MyAddress />}></Route>
          <Route path='/orders' element={<MyOrders />}></Route>
        </Route>


        <Route path='/checkout/:productId' element={<Checkout />}></Route>

        <Route element={<AdminRoute />}>
          <Route path='/dashboard' element={<Dashboard />}></Route>
        </Route>

        <Route path='/product/:productId' element={<Product />}></Route>

        <Route path='/categoryProducts/:categoryId' element={<CategoryProduct />}></Route>

      </Routes>

      <Footer />

      <ToastContainer autoClose={3000} pauseOnHover={false} theme={theme}/>

    </BrowserRouter>
  )
}
