import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { CancelIcon, LeftArrowIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import FailedIcon from '../assets/images/failed.png'
import BackgroundImage from '../assets/images/background.png'

const Transfer = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [transferSuccessfulModal, setTransferSuccessfulModal] = useState(true);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);
    const [transferFailedModal, setTransferFailedModal] = useState(false);

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

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!amount) {
            setAmountError('Please enter a valid phone number with 11 digits.');
        }
        if (amount && email) {
            setShowModal(true);
            // setTransferSuccessfulModal(true);
            // setTransferFailedModal(true);
            // setPaymentSuccessfulModal(true);
            setAmount('')
            setAmountError('');
            setEmail('');
            setEmailError('')

        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // setTransferFailedModal(false);
        // setTransferSuccessfulModal(false);
        // setPaymentSuccessfulModal(false);
        navigate('/home');
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

                                <div className=''>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Amount</p>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='eg: $200'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}

                                </div>
                                <div className='mt-5'>
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
                            </div>
                            <button
                                type="submit"
                                className='bg-[#D45A0E] h-16 mt-20 w-full rounded-[35px] flex justify-center items-center '>
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
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
                                <FaInstagram className='text-white' />
                                <FiFacebook className='text-white' />
                                <RiTwitterXLine className='text-white' />

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
                        <p className='text-white font-[400]  font-poppins text-sm '>Email:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>example@gmail.com</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>$200</p>
                    </div>
                    <button

                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
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

                    <div className='flex justify-end items-center' onClick={() => setTransferSuccessfulModal(false)}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={SuccessIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Transfer Successful</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Thank you for patronizing us today.
                        We value you!</p>
                    <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p>



                </div>
            )}
            {transferFailedModal && (
                <div className='fixed  inset-0 mx-2 bg-[#1E1E1E] h-[450px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'
                >

                    <div className='flex justify-end items-center' onClick={() => setTransferFailedModal(false)}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={FailedIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Transfer Failed</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Due to insufficient funds.</p>
                    <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p>



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

                    <div className='flex justify-end items-center' onClick={() => setPaymentSuccessfulModal(false)}>
                        <CancelIcon />
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={SuccessIcon} />
                    </div>
                    <p className='text-white font-[400] font-poppins text-2xl text-center'>Payment Successful</p>
                    <p className='text-[#FFFFFF6B] font-[300] font-poppins text-base text-center'>Thank you for patronizing us today.
                        We value you!</p>
                    <p className='text-[#0D7CFF] font-[300] font-poppins text-base text-center'>View  receipt</p>



                </div>
            )}
        </div>
    )
}

export default Transfer
