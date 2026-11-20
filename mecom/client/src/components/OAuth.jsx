import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app, firebaseConfigured } from '../firebase.js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInFailure, signInStart, signInSuccess, signOutSuccess } from '../redux/user/userSlice.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OAuth({ adminOnly = false }) {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    if (!firebaseConfigured) {
      toast.error('Google sign-in needs VITE_FIREBASE_API_KEY in client/.env. Restart the client after adding it.');
      return;
    }

    try {
      dispatch(signInStart());
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
  
      const res = await fetch('/api/auth/google', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: result.user.displayName,
          email: result.user.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
      
      if (adminOnly && !data.isAdmin) {
        await fetch('/api/auth/signout', { credentials: 'include', method: 'POST' });
        dispatch(signOutSuccess());
        dispatch(signInFailure('This Google account does not have admin access.'));
        toast.error('This Google account does not have admin access.');
        return;
      }
      dispatch(signInSuccess(data));
      toast.success(adminOnly ? 'Admin sign in successful!' : 'Sign in successful!')
      navigate(adminOnly ? '/dashboard?tab=productLists' : '/');
      
    } catch (error) {
      dispatch(signInFailure(error.message));
      toast.error(error.message);
    }
  }


  return (
    <button type='button' onClick={handleGoogleClick} className='bg-white border p-3 w-full flex items-center justify-center gap-1 font-semibold rounded-xl mt-8 shadow-md '><FcGoogle />Continue with Google</button>
  )
}
