
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Signup from './pages/Signup';
import OTP from './pages/OTP';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import BuyData from './pages/BuyData';
import BuyAirtime from './pages/BuyAirtime';

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
          <Route path="/buy-data" element={<BuyData />} />
          <Route path="/buy-airtime" element={<BuyAirtime />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
