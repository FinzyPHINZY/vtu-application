import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import {
    useValidateVerificationMutation,
    useCreateSubAccountMutation
} from '../services/apiService';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
// import { setStatus } from '../store/slices/userSlices';
// import { useDispatch } from 'react-redux';

const CompleteSignup3 = () => {
    // const dispatch = useDispatch();
    const [isMobileView, setIsMobileView] = useState(false);
    const storedUser = useSelector((state: RootState) => state.user.user);
    const bvn = useSelector((state: RootState) => state.user.bvn);
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [number, setNumber] = useState('');
    const [numberError, setNumberError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [validateVerification] = useValidateVerificationMutation();
    const [createSubAccount] = useCreateSubAccountMutation();
    const [loading, setLoading] = useState(false);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    // const debitAccountNumber = process.env.REACT_APP_DEBIT_ACCOUNT_NUMBER;
    // const otp = process.env.REACT_APP_OTP;

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
        navigate("/home");
    };

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFirstName(value);

    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLastName(value);

    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;


        const cleanValue = value.startsWith('+')
            ? '+' + value.replace(/[+\D]/g, '')
            : value.replace(/\D/g, '');

        console.log('Original value:', value);
        console.log('Cleaned value:', cleanValue);


        const phoneNumberPattern = /^(\+234|234|0)[1-9]\d{9}$/;

        if (!phoneNumberPattern.test(cleanValue)) {
            console.log('Validation failed');
            setNumberError('Please enter a valid phone number in either format:\n+234XXXXXXXXXX\nor\n234XXXXXXXXXX');
        } else {
            console.log('Validation passed');
            setNumberError('');
        }

        setNumber(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOtp(value);

        if (otp) {
            setOtpError('');
        } else {
            setOtpError('Please enter your otp.');
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (storedUser.isGoogleUser ? (number && otp) : otp) {
            setOtpError('');
            setNumberError("")
            setFirstNameError("")
            setLastNameError("")
            try {

                setLoading(true);
             
                    const secondResponse = await validateVerification({
                 
                        otp: otp,
                        identityId: localStorage.getItem('identityId') ,
                        token: storedToken
                    });

                    if (secondResponse.data) {

                        toast.success(secondResponse.data.message);
                        const thirdResponse = await createSubAccount({
                            phoneNumber: storedUser.phoneNumber || number,
                            emailAddress: storedUser.email,
                            identityId: localStorage.getItem('identityId'),
                            identityNumber: bvn,
                            identityType: "BVN",
                            otp: otp,
                            token: storedToken
                        });
                        // dispatch(setStatus(response.data.data.status));
                        if (thirdResponse.data.success) {
                        toast.success(thirdResponse.data.message);
                        navigate('/home');
                            } else {
                                toast.error("Sub-account creation failed. Please try again.");
                            }
                    } else {
                        toast.error("validation verification failed. Please try again.");
                    }
              
            } catch (err) {

                console.error(err);
                toast.error('There was an error. Please try again.');
            } finally {
                setOtp("")
                setNumber("")
                setLastName("")
                setFirstName("")
                setLoading(false);
            }
        } else {
            setNumberError('Please enter a valid phone number.');
            setOtpError('Please enter your BVN.');
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

                            <div>       </div>
                        </div>
                        <div className='text-white font-[600] text-lg font-poppins mt-10'>Verify your account</div>
                        <form className='mt-20' onSubmit={handleSubmit}>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>OTP Code</p>
                                    <input
                                        type='number'
                                        value={otp}
                                        onChange={handleInputChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='Enter OTP'
                                    />
                                    {otpError && <p className='text-[#D45A0E] text-sm text-center'>{otpError}</p>}
                                </div>
                                {storedUser.isGoogleUser &&
                                    <>
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
                                                placeholder='+2348126232067'
                                            />
                                            {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                        </div>
                                    </>
                                }


                               
                            </div>

                            <button
                                type="submit"
                                className='bg-[#D45A0E] h-16 mt-16 w-full rounded-[35px] flex justify-center items-center '>

                                {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                                    :
                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>}

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

export default CompleteSignup3
