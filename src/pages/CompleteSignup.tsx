import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import { toast } from 'react-toastify';
import { Circles } from 'react-loader-spinner';
import { useCompleteSignupMutation } from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';

const CompleteSignup = () => {
    const dispatch = useDispatch();
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [number, setNumber] = useState('');
    const [numberError, setNumberError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [completeSignup] = useCompleteSignupMutation();
    const storedEmail = useSelector((state: RootState) => state.user.email);
    console.log(storedEmail)
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

    const validatePassword = (password: string) => {
        const minLength = 8;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const digitRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length < minLength) {
            return false;
        }
        if (!uppercaseRegex.test(password)) {
            return false;
        }
        if (!lowercaseRegex.test(password)) {
            return false;
        }
        if (!digitRegex.test(password)) {
            return false;
        }
        if (!specialCharRegex.test(password)) {
            return false;
        }
        return true;
    };


    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (!validatePassword(value)) {
            setPasswordError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== password) {
            setConfirmPasswordError('Passwords do not match.');
        } else {
            setConfirmPasswordError('');
        }
    };
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);



    };
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFirstName(value);



    };
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLastName(value);



    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password && firstName && lastName && confirmPassword && validatePassword(password) && password === confirmPassword
            && number && number.length >= 10) {
            setPasswordError('');
            setNumberError("")
            setFirstNameError("")
            setLastNameError("")
            setConfirmPasswordError('');
            setLoading(true);
            // navigate('/login');
            try {
                setLoading(true);
                const response = await completeSignup({ firstName, lastName, email: storedEmail, phoneNumber: number, password, });
                if (response.data.success) {
                    toast.success(response.data.message);
                    dispatch(setUserInfo(response.data.data));
                    navigate('/login');
                } else {
                    toast.error(response.data.message);
                }
            } catch (err) {
                console.error(err);
                toast.error('Password creation failed. Please try again.');
            } finally {
                setLoading(false);
                setPassword("")
                setConfirmPassword("")
                setNumber("")
                setLastName("")
                setFirstName("")
            }
        } else {
            setPasswordError('Please enter a valid email address.');
            setConfirmPasswordError('Passwords do not match.');
            setNumberError('Please enter a valid phone number.');
            setFirstNameError('Please provide your first name.');
            setLastNameError('Please provide your last name.');
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
                            <p className='text-white font-[600] text-lg font-kavoon'>Create Password</p>
                            <div>       </div>
                        </div>

                        <form className='mt-20 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
                            <div>
                                <div >
                                    <p className='text-white font-[500] text-base font-poppins mb-5'> First Name</p>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={handleFirstNameChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Name'
                                    />
                                    {firstNameError && <p className='text-[#D45A0E] text-sm text-center'>{firstNameError}</p>}

                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Last Name</p>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={handleLastNameChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Name'
                                    />
                                    {lastNameError && <p className='text-[#D45A0E] text-sm text-center'>{lastNameError}</p>}

                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Phone number</p>
                                    <input
                                        type="number"
                                        value={number}
                                        onChange={handleNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='+2345678909'
                                    />
                                    {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Password</p>
                                    <input
                                        type='password'
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Enter your password'
                                    />
                                    {passwordError && <p className='text-[#D45A0E] text-sm text-center'>{passwordError}</p>}
                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Confirm Password</p>
                                    <input
                                        type='password'
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Confirm your password'
                                    />
                                    {confirmPasswordError && <p className='text-[#D45A0E] text-sm text-center'>{confirmPasswordError}</p>}
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

export default CompleteSignup
