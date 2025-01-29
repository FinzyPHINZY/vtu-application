
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
import UseTransactionPin from './pages/UseTransactionPin';

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/account/create" element={<Signup />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password/request-password" element={<ForgotPassword />} />
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/data" element={<BuyData />} />
          <Route path="/airtime" element={<BuyAirtime />} />
          <Route path="/home" element={<Home />} />
          <Route path="/utility" element={<BuyElectricity />} />
          <Route path="/cable" element={<BuyCable />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pin/create" element={<CreateTransactionPin />} />
          <Route path="/pin/enter" element={<UseTransactionPin />} />
          <Route path="/account/complete-registration" element={<CompleteSignup />} />
          <Route path="/verification/complete" element={<CompleteSignup2 />} />
          <Route path="/verification/validate" element={<CompleteSignup3 />} />
          <Route path="/otp/reset" element={<ResetPasswordOTP />} />
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
