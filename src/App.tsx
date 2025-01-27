
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Signup from './pages/Signup';
import OTP from './pages/OTP';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import BuyData from './pages/BuyData';
import BuyAirtime from './pages/BuyAirtime';
import Home from './pages/Home';
import BuyElectricity from './pages/BuyElectricity';
import BuyCable from './pages/BuyCable';
import TransactionHistory from './pages/TransactionHistory';
import Transfer from './pages/Transfer';
import Profile from './pages/Profile';
import CreateTransactionPin from './pages/CreateTransactionPin';
import swDev from './swDev';
import CompleteSignup from './pages/CompleteSignup';
import { ToastContainer } from 'react-toastify';
import ResetPassword from './pages/ResetPassword';
import CompleteSignup2 from './pages/CompleteSignup2';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import CompleteSignup3 from './pages/CompleteSignup3';

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/create-account" element={<Signup />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/buy-data" element={<BuyData />} />
          <Route path="/buy-airtime" element={<BuyAirtime />} />
          <Route path="/home" element={<Home />} />
          <Route path="/buy-electricity" element={<BuyElectricity />} />
          <Route path="/buy-cable" element={<BuyCable />} />
          <Route path="/all-transactions" element={<TransactionHistory />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-pin" element={<CreateTransactionPin />} />
          <Route path="/complete-signup" element={<CompleteSignup />} />
          <Route path="/complete-verification" element={<CompleteSignup2 />} />
          <Route path="/validate-verification" element={<CompleteSignup3 />} />
          <Route path="/reset-otp" element={<ResetPasswordOTP />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  )
}
// swDev();

try {
  swDev();
} catch (error) {
  console.error("Service worker registration failed:", error);
}

export default App
