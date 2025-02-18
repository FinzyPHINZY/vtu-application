
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
// import swDev from './swDev';
import CompleteSignup from './pages/CompleteSignup';
import { ToastContainer } from 'react-toastify';
import ResetPassword from './pages/ResetPassword';
import CompleteSignup2 from './pages/CompleteSignup2';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import CompleteSignup3 from './pages/CompleteSignup3';
import UseTransactionPin from './pages/UseTransactionPin';
import PWABadge from './PWABadge.tsx'
import UseTransactionPin2 from './pages/UseTransactionPin2.tsx';
import UseTransactionPin3 from './pages/UseTransactionPin3.tsx';
import UseTransactionPin4 from './pages/UseTransactionPin4.tsx';
import UseTransactionPin5 from './pages/UseTransactionPin5.tsx';
import Deposit from './pages/Deposit.tsx';
import ActivityTracker from './store/ActivityTracker.tsx';

function App() {


  return (
    <>
      <Router>
        <ActivityWrapper />
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
          <Route path="/pin/data/enter" element={<UseTransactionPin />} />
          <Route path="/pin/airtime/enter" element={<UseTransactionPin2 />} />
          <Route path="/pin/utility/enter" element={<UseTransactionPin3 />} />
          <Route path="/pin/cable/enter" element={<UseTransactionPin4 />} />
          <Route path="/pin/transfer/enter" element={<UseTransactionPin5 />} />
          <Route path="/account/complete-registration" element={<CompleteSignup />} />
          <Route path="/verification/initiate" element={<CompleteSignup2 />} />
          <Route path="/verification/validate" element={<CompleteSignup3 />} />
          <Route path="/otp/reset" element={<ResetPasswordOTP />} />
          <Route path="/deposit" element={<Deposit />} />

        </Routes>
      </Router>
      <ToastContainer />

      <PWABadge />
    </>
  )
}

const ActivityWrapper = () => {
  return <ActivityTracker />; // Render the ActivityTracker component within the Router context
};


export default App
