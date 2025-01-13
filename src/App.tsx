
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
          <Route path="/home" element={<Home />} />
          <Route path="/buy-electricity" element={<BuyElectricity />} />
          <Route path="/buy-cable" element={<BuyCable />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
