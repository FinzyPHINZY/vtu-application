import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import MTN from '../assets/images/mtn.png'
import DSTV from '../assets/images/dstv.png'
import EEDC from '../assets/images/eedc.png'
import More from '../assets/images/more.png'
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { MailBoxIcon } from '../assets/svg'
import BackgroundImage from '../assets/images/background.png'
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode';
import { useGoogleLoginMutation } from '../services/apiService';
import { toast } from 'react-toastify';

const SplashScreen = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const [googleLoginMutation] = useGoogleLoginMutation();
    const navigate = useNavigate();
    const login =  useGoogleLogin({
        onSuccess: async token => {
            console.log(token)
            try {
                const response = await googleLoginMutation({ idToken: token });
                if (response.data.success) {
                    toast.success(response.data.message);
                    navigate('/home');
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch (err) {
                console.error(err);
                toast.error('Google Signup Failed. Please try again.');
            }

        },
        onError: error => {
            console.log(error)
        }
    })
    useEffect(() => {
        // Function to check screen size
        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };

        // Initial check
        handleResize();

        // Add resize event listener
        window.addEventListener("resize", handleResize);

        // Cleanup event listener on unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleEmailContinue = () => {
        navigate('/create-account');
    };

    // const handleLogout = () => {
    //     googleLogout();
    // }
    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'
                        style={{
                            backgroundImage: `url(${BackgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}>
                        <div className='text-white font-[600] text-lg font-kavoon'>Bold data</div>
                        <div>
                            <div className='flex justify-center items-center gap-4'>
                                <img src={DSTV} className='w-15 h-15 rounded-xl' />
                                <div className='flex flex-col justify-center gap-4'>
                                    <img src={MTN} className='w-15 h-15 rounded-xl' />
                                    <img src={EEDC} className='w-15 h-15 rounded-xl' />
                                </div>
                                <img src={More} className='w-15 h-15 rounded-xl' />
                            </div>
                            <p className='text-2xl text-center font-[700]  font-mochiy-pop-one mt-7 text-white'>Bills made simple</p>
                            <p className='text-base px-5 font-[200] text-center font-mochiy-pop-one text-white mt-2'>Lorem ipsum dolor sit amet consectetur. Nullam vitae neque augue diam pharetra turpis est. Dignissim amet et orci cras eget vitae .</p>
                        </div>
                        <div className='mb-16'>
                            <div className='bg-white h-16 mb-5 rounded-[35px] flex justify-center items-center gap-8 max-sm:gap-6 ' onClick={() => login()}>
                                {/* <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        console.log(credentialResponse)
                                        console.log(jwtDecode(credentialResponse.credential))
                                        navigate("/home")
                                    }}
                                    onError={() => console.log("Login Failed")}
                                    auto_select={true} /> */}
                                <FcGoogle />
                                <p className='text-black font-[300] font-poppins text-base'>Continue with Google</p>
                            </div>
                            <div className='bg-[#2F2F2F] h-16 mb-5 rounded-[35px] flex justify-center items-center gap-8 max-sm:gap-6'
                                onClick={handleEmailContinue}>
                                <MailBoxIcon />
                                <p className='text-white font-[300]  font-poppins text-base'>Continue with email</p>
                            </div>
                            <p className='text-white font-[200] font-poppins text-sm text-center' onClick={() => navigate("/login")}>Login</p>
                        </div>
                    </div>
                ) : (
                    // JSX for screens above 768px
                    <div className='min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between'>
                        <div className='text-white font-[500] font-kavoon text-2xl'>Bold data</div>
                        <div className='flex justify-center items-center '>
                            <img src={DesktopImage} className='w-60 h-60 ' />
                        </div>

                        <div className=''>
                            <p className='text-yellow-300 font-[400]  font-poppins text-4xl mb-3 text-center'>Desktop site is currently unavailable</p>
                            <p className='text-white font-[400]  font-poppins text-2xl text-center'>Please use mobile version or resize your browser</p>
                        </div>

                        <div>
                            <p className='text-white font-[400]  font-poppins text-2xl text-center mb-2'>Follow us on</p>
                            <div className='flex flex-1 justify-center items-center gap-4'>
                                <FaInstagram className='text-white' />
                                <FiFacebook className='text-white' />
                                <RiTwitterXLine className='text-white' />

                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}

export default SplashScreen
