import { useState, useEffect } from "react";
import DesktopImage from "../assets/images/bold-data.png";
import { useNavigate } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  ArrowRight,
  CustomerSupport2,
  LeftArrowIcon,
  TransactionPin,
} from "../assets/svg";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { FaUserCircle } from "react-icons/fa";
// import { FcAbout } from 'react-icons/fc';

// Function to open Tawk.to chat widget
const openTawkToChat = () => {
  if (window.Tawk_API && window.Tawk_API.maximize) {
    window.Tawk_API.maximize();
  }
};

const Profile = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();
  const storedUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobileView(isMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {isMobileView ? (
        // JSX for screens below 768px
        <div className="min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-start">
          <div className="flex justify-between items-center">
            <LeftArrowIcon onClick={handleBack} />
            <p className="text-white font-[400] text-base font-poppins">
              Profile
            </p>
            <div></div>
          </div>
          <div className="bg-[#1E1E1E] h-[35%] mt-3 px-5 pb-10 pt-8 rounded-[15px] flex flex-col justify-center items-center">
            <FaUserCircle className="h-16 w-16 text-white" />
            <p className="text-white font-[500] text-xl font-poppins mt-3">
              {storedUser.firstName} {storedUser.lastName}
            </p>
            <p className="text-white font-[300] text-base font-poppins mt-2">
              {storedUser.email}
            </p>
          </div>
          <div className="bg-[#1E1E1E] h-[15%] px-5 py-4 rounded-[15px] mt-3">
            <div
              className="flex justify-between items-center"
              onClick={openTawkToChat}
            >
              <div className="flex justify-start items-center gap-4">
                <CustomerSupport2 />
                <p className="text-[#FFFFFF] font-[400] text-base font-poppins">
                  Customer Care
                </p>
              </div>
              <ArrowRight />
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex justify-start items-center gap-4">
                <TransactionPin />
                <p className="text-[#FFFFFF] font-[400] text-base font-poppins">
                  Transaction PIN
                </p>
              </div>
              <div onClick={() => navigate("/pin/create")}>
                <ArrowRight />
              </div>
            </div>
          </div>

          <p
            className="text-[#D45A0E] text-center font-[400] text-sm font-poppins mt-5"
            onClick={() => {
              return storedUser.isGoogleUser
                ? navigate("/")
                : navigate("/login");
            }}
          >
            Log Out
          </p>
        </div>
      ) : (
        // JSX for screens above 768px
        <div className="min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between">
          <div className="text-white font-[500] font-kavoon text-2xl">
            Bold data
          </div>
          <div className="flex justify-center items-center">
            <img src={DesktopImage} className="w-60 h-60" />
          </div>
          <div className="">
            <p className="text-white font-[400]  font-poppins text-4xl mb-3 text-center">
              Desktop site is currently unavailable
            </p>
            <p className="text-white font-[400]  font-poppins text-2xl text-center">
              Please use mobile version or resize your browser
            </p>
          </div>
          <div>
            <p className="text-white font-[400]  font-poppins text-2xl text-center mb-2">
              Follow us on
            </p>
            <div className="flex flex-1 justify-center items-center gap-4">
              <a
                href="https://www.instagram.com/data.bold/#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="text-white" />
              </a>
              <a
                href="https://web.facebook.com/people/BOLD-DATA/61565221174295/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFacebook className="text-white" />
              </a>
              <a
                href="https://wa.me/2348036813099"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp className="text-white" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
