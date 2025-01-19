import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg'
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useVerifyOtpMutation } from '../services/apiService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Circles } from 'react-loader-spinner';

const OTP = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [loading, setLoading] = useState(false);
    const storedOtp = useSelector((state: RootState) => state.user.otp);
    const storedEmail = useSelector((state: RootState) => state.user.email);
    const [verifyOtp] = useVerifyOtpMutation();

    console.log(storedEmail, 44)
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

    const handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        const value = e.target.value;
        setOtp(value);

     
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (otp) {
            setOtpError('');
            try {
                console.log(1)
                setLoading(true);
                const response = await verifyOtp({ email: storedEmail, otp: storedOtp });
                console.log(2)
                if (response.data.success) {
                    console.log(3)
                    toast.success(response.data.message);
                    navigate('/login');
                    console.log(4)
                } else {
                    console.log(5)
                    toast.error(response.data.message);
                }
            } catch (err) {
                console.log(6)
                console.error(err);
                toast.error('Failed to send OTP. Please try again.');
            } finally {
                console.log(7)
                setLoading(false);
            }
        } else {
            console.log(8)
            setOtpError('Please enter a valid email address.');
        }
    };
    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />

                            <div>       </div>
                        </div>
                        <div className='text-white font-[600] text-lg font-poppins mt-10'>Enter OTP</div>
                        <form className='mt-20 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
                            <div>
                                <p className='text-white font-[500] text-base font-poppins mb-5'>OTP Code</p>
                                <input
                                    type='number'
                                    value={otp}
                                    onChange={handleInputChange}
                                    className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                    placeholder='6-digits'
                                />
                                {otpError && <p className='text-[#D45A0E] text-sm text-center'>{otpError}</p>}
                            </div>
                            <button
                                type="submit"
                                className='bg-[#D45A0E] h-16 mt-20 w-full rounded-[35px] flex justify-center items-center '>
                                {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                                    :
                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Next</p>}

                            </button>
                        </form>
                    </div>
                ) : (
                    // JSX for screens above 768px
                    <div className='min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between'>
                        <div className='text-white font-[500] font-kavoon text-2xl'>Bold data</div>
                        <div className='flex justify-center items-center '>
                            <img src={DesktopImage} className='w-60 h-60 ' />
                        </div>

                        <div className=''>
                            <p className='text-white font-[400]  font-poppins text-4xl mb-3 text-center'>Desktop site is currently unavailable</p>
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

export default OTP
