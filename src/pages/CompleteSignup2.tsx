import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import {
    useInitiateVerificationMutation,
    useValidateVerificationMutation,
    useCreateSubAccountMutation
} from '../services/apiService';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setStatus } from '../store/slices/userSlices';
import { useDispatch } from 'react-redux';

const CompleteSignup2 = () => {
    const dispatch = useDispatch();
    const [isMobileView, setIsMobileView] = useState(false);
    const storedUser = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();
    const [bvn, setBvn] = useState('');
    const [bvnError, setBvnError] = useState('');
    const [number, setNumber] = useState('');
    const [numberError, setNumberError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [initiateVerification] = useInitiateVerificationMutation();
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
        navigate(-1);
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
        const phoneNumberPattern = /^\+\d{1,3}\d{10}$/;

        if (!phoneNumberPattern.test(value)) {
            setNumberError('Please enter a valid phone number in the format +234XXXXXXXXXX');
        } else {
            setNumberError('');
        }

        setNumber(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBvn(value);

        if (bvn) {
            setBvnError('');
        } else {
            setBvnError('Please enter a valid email address.');
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (firstName && lastName && bvn && number && number.length >= 10) {
            setBvnError('');
            setNumberError("")
            setFirstNameError("")
            setLastNameError("")
            try {

                setLoading(true);
                const response = await initiateVerification({
                    type: "BVN",
                    async: false,
                    number: bvn,
                    debitAccountNumber: "0119017579",
                    token: storedToken
                });

                if (response.data.success) {
                    console.log(response.data.data._id, 400);
                    toast.success(response.data.message);
                    const secondResponse = await validateVerification({
                        type: "BVN",
                        otp: "456756",
                        identityId: response.data.data._id,
                        token: storedToken
                    });

                    if (secondResponse.data) {

                        toast.success(secondResponse.data.message);
                        await createSubAccount({
                            firstName: storedUser.firstName || firstName,
                            lastName: storedUser.lastName || lastName,
                            phoneNumber: storedUser.phoneNumber || number,
                            emailAddress: storedUser.email,
                            externalReference: "AC_1240",
                            bvn,
                            identityId: response.data.data._id,
                            identityNumber: bvn,
                            identityType: "BVN",
                            otp: "456756",
                            callbackUrl: "https://finzyphinzy.vercel.app",
                            autoSweep: false,
                            autoSweepDetails: {
                                "schedule": "Instant"
                            },
                            token: storedToken
                        });
                        dispatch(setStatus(response.data.data.status));
                        // if (thirdResponse.data.success) {
                        // toast.success(thirdResponse.data.message);
                        navigate('/login');
                        //     } else {
                        //         toast.error("Sub-account creation failed. Please try again.");
                        //     }
                    } else {
                        toast.error("validation verification failed. Please try again.");
                    }
                } else {
                    toast.error("verification initiation failed. Please try again.");
                }
            } catch (err) {

                console.error(err);
                toast.error('There was an error. Please try again.');
            } finally {
                setBvn("")
                setNumber("")
                setLastName("")
                setFirstName("")
                setLoading(false);
            }
        } else {
            setNumberError('Please enter a valid phone number.');
            setFirstNameError('Please provide your first name.');
            setLastNameError('Please provide your last name.');
            setBvnError('Please enter your BVN.');
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


                                <div className={`${storedUser.isGoogleUser ? '': 'mt-8'}`}>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>BVN Number</p>
                                    <input
                                        type='text'
                                        value={bvn}
                                        onChange={handleInputChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='22222222'
                                    />
                                    {bvnError && <p className='text-[#D45A0E] text-sm text-center'>{bvnError}</p>}
                                </div>
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

export default CompleteSignup2
