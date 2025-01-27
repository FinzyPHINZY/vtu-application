import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg'
import { useRequestOtpMutation } from '../services/apiService'; // Add this import
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setEmail } from '../store/slices/userSlices';
import { Circles } from 'react-loader-spinner';


const Signup = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [email, setEmailState] = useState('');
    const [emailError, setEmailError] = useState('');
    const [requestOtp] = useRequestOtpMutation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };


        handleResize();


        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    interface ValidateEmail {
        (email: string): boolean;
    }

    const validateEmail: ValidateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmailState(value);

        if (validateEmail(value)) {
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address.');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateEmail(email)) {
            setEmailError('');
            try {
                setLoading(true)
                dispatch(setEmail(email));
                const response = await requestOtp(email).unwrap();
                toast.success(response.message);
            
                navigate('/otp');
            } catch (err) {
                console.error(err);
                toast.error('Failed to send OTP. Please try again.');
            } finally {
                setLoading(false)
                setEmailState("")
            }
        } else {
            
            setEmailError('Please enter a valid email address.');
        }
    };
    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col '>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[600] text-lg font-kavoon'>Bold data</p>
                            <div>       </div>
                        </div>
                        <div className='text-white font-[600] text-lg font-poppins mt-10'>Continue with email</div>
                        <form className='mt-20' onSubmit={handleSubmit}>
                            <p className='text-white font-[500] text-base font-poppins mb-5'>Email</p>
                            <input
                                type='email'
                                value={email}
                                onChange={handleInputChange}
                                className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                placeholder='example@gmail.com'
                            />
                            {emailError && <p className='text-[#D45A0E] text-sm text-center'>{emailError}</p>}
                            <p className='text-[#FFFFFF6B] font-[400] text-sm text-end font-poppins mt-5'>Already a user? <span className='text-[#0D7CFF]' onClick={() => navigate("/login")}>login</span></p>

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

export default Signup
