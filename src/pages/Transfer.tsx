import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { CancelIcon, LeftArrowIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import FailedIcon from '../assets/images/failed.png'
import BackgroundImage from '../assets/images/background.png'
import {
    useGetBankListQuery,
    useTransferFundsMutation,
    useGetTransferStatusMutation,
    useGetUserDetailsQuery,
} from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';

const Transfer = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [amount, setAmount] = useState(() => localStorage.getItem('amount') || '')
    const [email, setEmail] = useState(() => localStorage.getItem('beneficiaryEmail') || '');
    const [emailError, setEmailError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [narration, setNarration] = useState(() => localStorage.getItem('narration') || '')
    const [narrationError, setNarrationError] = useState("")
    // const [verifiedAccountData, setVerifiedAccountData] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [transferSuccessfulModal, setTransferSuccessfulModal] = useState(false);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);
    const [transferFailedModal, setTransferFailedModal] = useState(false);
    const [payeeId, setPayeeId] = useState("")
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const { data: bankListData, error, isLoading } = useGetBankListQuery({ token: storedToken });
    const { data: userDetails } = useGetUserDetailsQuery({ token: storedToken });
    const [transferFunds] = useTransferFundsMutation();
    const [transferStatus] = useGetTransferStatusMutation();
    // const [transferStatus] = useGetTransferStatusMutation();
    const { secondData } = location.state || {};

    useEffect(() => {

        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };


        handleResize();


        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        console.log(bankListData);
    }, [bankListData, error, isLoading]);

    useEffect(() => {
        if (secondData) {
            setShowModal(true);
        }
    }, [secondData]);


    interface ValidateEmail {
        (email: string): boolean;
    }


    const validateEmail: ValidateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
    useEffect(() => {
        // Store amount and number in localStorage
        localStorage.setItem('amount', amount);
        localStorage.setItem('beneficiaryEmail', email);
        localStorage.setItem('narration', narration);
    }, [amount, email, narration]);

    const handleBack = () => {
        navigate("/home");
    };




    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
    };



    const handleNarrationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNarration(value);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!amount) {
            setAmountError('Please enter an amount.');
            return
        }
        if (!email) {
            setEmailError('Please enter the beneficiary email address on bolddata');
            return
        }
        if (amount && email) {
            setAmountError('');
            setEmailError("");
            setNarrationError("")
            try {

                setLoading(true);
                const checkEmail = async () => {
                    const response = await transferStatus({
                        email,
                        token: storedToken,
                    });
                    if (response?.data?.success) {
                        toast.success(response.data.message);
                        setPayeeId(response.data.data.id)
                    } else {
                        toast.error(response.data.message);
                        setEmail("");
                        setAmount("");
                        setNarration("")
                        return;
                    }
                }
                checkEmail();

                navigate('/pin/transfer/enter', { state: { service: "transfer" } });


            } catch (err) {

                console.error(err);
                toast.error('Transaction failed. Please try again.');
            } finally {

                setLoading(false);
            }
        }
    };



    const handleCloseModal = async () => {

        try {

            setLoading(true);

            const response = await transferFunds({
                payeeId: payeeId,
                token: storedToken,

                amount: parseInt(amount, 10),

                transactionPin: storedPin,

            });

            if (response?.data?.success) {

                toast.success(response.data.message);
                dispatch(setUserInfo(userDetails.data));
                setPaymentSuccessfulModal(true);

            } else {

                if (response.error && 'data' in response.error) {
                    console.log(response.error)
                    console.log((response.error.data as { message: string }).message);
                    const errorMessage = (response.error.data as { message: string }).message
                    toast.error(errorMessage);
                }

            }
        } catch (error) {

            console.error(error);
            toast.error((error as { data: { message: string } })?.data?.message);
            setTransferFailedModal(true);

            // toast.error('Transaction failed. Please try again.');
        } finally {
            setEmail("");
            setAmount("");
            setNarration("")
            localStorage.setItem('amount', '');
            localStorage.setItem('beneficiaryEmail', '');
            localStorage.setItem('narration', '');
            setLoading(false);
            setShowModal(false);
        }
    };


    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 '>
                        {(showModal || transferFailedModal || transferSuccessfulModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}

                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Transfer</p>
                            <div>       </div>
                        </div>
                        <p className='text-[#4CAF50] font-[600] font-poppins text-xl my-5'>Safe & secure</p>
                        <form className='mt-5 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
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
                                {/* <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-2'>Select Provider</p>
                                    <div className="relative"> */}
                                {/* <select
                                            value={selectedPackage}
                                            onChange={handlePackageChange}
                                            className='w-full h-16 border border-[#E0E0E0] rounded-[35px] pl-4 pr-10 text-white bg-black outline-none appearance-none'
                                        >
                                            <option value="" disabled>Select Bank</option>
                                            {packageOptions.map((option: string, index: number) => (
                                                <option key={index} value={option}>{option}</option>
                                            ))}
                                        </select> */}
                                {/* ? packageOptions.find(option => option.code === selectedPackage)?.name : '' */}
                                {/* <select
                                            value={selectedPackage}
                                            onChange={handlePackageChange}
                                            className='w-full h-16 border border-[#E0E0E0] rounded-[35px] pl-4 pr-10 text-white bg-black outline-none appearance-none'
                                        >
                                            <option value="" disabled>Select Bank</option>
                                            {packageOptions.map((option, index) => (
                                                <option key={index} value={option.name}>{option.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                                            <svg className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M10 12l-6-6h12l-6 6z" />
                                            </svg>
                                        </div>
                                    </div>


                                    {packageError && <p className='text-[#D45A0E] text-sm text-center'>{packageError}</p>}
                                </div> */}

                                {/* {verifiedAccountData && <p className='text-[#4CAF50] font-[400] text-sm font-poppins mt-3'>{verifiedAccountData}</p>} */}
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-2'>Amount</p>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='eg: $200'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}

                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-2'>Narration</p>
                                    <textarea
                                        value={narration}
                                        onChange={handleNarrationChange}
                                        className='w-full h-32 border border-[#E0E0E0] rounded-[35px] px-4 py-2 text-white bg-black outline-none resize-none'
                                        placeholder='Narration'
                                    />
                                    {narrationError && <p className='text-[#D45A0E] text-sm text-center'>{narrationError}</p>}

                                </div>
                            </div>
                            <button
                                type="submit"
                                className='bg-[#D45A0E] h-16 mt-20 w-full rounded-[35px] flex justify-center items-center '>
                                {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                                    :
                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
                                }

                            </button>
                        </form>
                    </div>
                ) : (
                    // JSX for screens above 768px
                    <div className='min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between'>
                        {(showModal || transferFailedModal || transferSuccessfulModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}

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

            {/* Modal Component */}
            {showModal && (
                <div className='fixed bottom-0 inset-x-0 bg-[#1E1E1E] h-[300px] py-5 px-10 flex z-50 justify-between flex-col'>
                    <div className='flex justify-between items-center'>
                        <div>             </div>
                        <p className='text-white font-[500]  font-poppins text-base '>Summary</p>
                        <div onClick={() => setShowModal(false)}>
                            <CancelIcon />
                        </div>

                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Type:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>Transfer</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-[13px] '>Beneficiary Email address</p>
                        <p className='text-white font-[400]  font-poppins text-[13px] '>{email}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{amount}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Narration:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{narration}</p>
                    </div>
                    <button

                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                            :
                            <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
                        }

                    </button>
                </div>
            )}
            {transferSuccessfulModal && (
                <div className='fixed  inset-0 mx-2 bg-[#1E1E1E] h-[450px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'
                    style={{
                        backgroundImage: `url(${BackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}>

                    <div className='flex justify-end items-center' onClick={() => { setTransferSuccessfulModal(false); navigate("/home") }}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={SuccessIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Transfer Successful</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Thank you for patronizing us today.
                        We value you!</p>
                    {/* <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p> */}



                </div>
            )}
            {transferFailedModal && (
                <div className='fixed  inset-0 mx-2 bg-[#1E1E1E] h-[450px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'
                >

                    <div className='flex justify-end items-center' onClick={() => { setTransferFailedModal(false); navigate("/home") }}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={FailedIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Transfer Failed</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Due to insufficient funds.</p>
                    {/* <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p> */}



                </div>
            )}
            {paymentSuccessfulModal && (
                <div className='fixed  inset-0 mx-2 bg-[#1E1E1E] h-[450px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'
                    style={{
                        backgroundImage: `url(${BackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}>

                    <div className='flex justify-end items-center' onClick={() => { setPaymentSuccessfulModal(false); navigate("/home") }}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={SuccessIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Payment Successful</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Thank you for patronizing us today.
                        We value you!</p>
                    {/* <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p> */}



                </div>
            )}
        </div>
    )
}

export default Transfer


