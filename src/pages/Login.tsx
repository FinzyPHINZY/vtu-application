import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../services/apiService';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';
import { loginUser } from '../store/slices/authSlices';


const Login = () => {
    const dispatch = useDispatch();
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [login] = useLoginMutation();

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

    interface ValidatePassword {
        (password: string): boolean;
    }
    const validateEmail: ValidateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword: ValidatePassword = (password) => {
        const minLength = 8;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const digitRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length < minLength) {
            setPasswordError("Password must be at least 8 characters long.");
            return false;
        }
        if (!uppercaseRegex.test(password)) {
            setPasswordError("Password must contain at least one uppercase letter.");
            return false;
        }
        if (!lowercaseRegex.test(password)) {
            setPasswordError("Password must contain at least one lowercase letter.");
            return false;
        }
        if (!digitRegex.test(password)) {
            setPasswordError("Password must contain at least one digit.");
            return false;
        }
        if (!specialCharRegex.test(password)) {
            setPasswordError("Password must contain at least one special character.");
            return false;
        }
        setPasswordError('');
        return true;
    };
    const handleBack = () => {
        navigate(-1);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (validateEmail(value)) {
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address.');
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);

        validatePassword(value);

    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateEmail(email) && validatePassword(password)) {
            setEmailError('');
            setPasswordError('');
            setLoading(true);
            try {
                const response = await login({ email, password });
                if (response.data.success) {
                    toast.success(response.data.message);
                    dispatch(setUserInfo(response.data.data));
                    console.log(response.data.data)
                    dispatch(loginUser(response.data.token));
                    navigate('/home');
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to login. Please try again.');
            } finally {
                setLoading(false);
                setEmail("")
                setPassword("")
            }
        } else {
            setEmailError('Please enter a valid email address.');
            setPasswordError('Please enter a valid password');
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
                            <p className='text-white font-[600] text-lg font-kavoon'>Bold data</p>
                            <div>       </div>
                        </div>
                        <div className='text-white font-[600] text-lg font-poppins mt-10'>Login with your credentials</div>
                        <form className='mt-12 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Email</p>
                                    <input
                                        type='email'
                                        value={email}
                                        onChange={handleEmailChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='example@gmail.com'
                                    />
                                    {emailError && <p className='text-[#D45A0E] text-sm text-center'>{emailError}</p>}
                                </div>
                                <div className='mt-12'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Password</p>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Enter your password'
                                    />
                                    {passwordError && <p className='text-[#D45A0E] text-sm text-center'>{passwordError}</p>}
                                    <p className='text-[#FFFFFF6B] font-[400] text-sm text-end font-poppins mt-5' onClick={() => navigate("/password/request-password")}>forgot password?</p>
                                </div>
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
                                <a href="https://www.instagram.com/data.bold/#" target="_blank" rel="noopener noreferrer">
                                    <FaInstagram className='text-white' />
                                </a>
                                <a href="https://web.facebook.com/people/BOLD-DATA/61565221174295/" target="_blank" rel="noopener noreferrer">
                                    <FiFacebook className='text-white' />
                                </a>

                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}

export default Login
