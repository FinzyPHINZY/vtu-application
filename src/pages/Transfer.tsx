import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { CancelIcon, LeftArrowIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import FailedIcon from '../assets/images/failed.png'
import BackgroundImage from '../assets/images/background.png'
import {
    useGetBankListQuery,
    useVerifyBankAccountMutation,
    useTransferFundsMutation,
    //    useGetTransferStatusMutation
} from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const Transfer = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [amount, setAmount] = useState(() => localStorage.getItem('amount') || '')
    const [accountNumber, setAccountNumber] = useState(() => localStorage.getItem('accountNumber') || '');
    const [accountNumberError, setAccountNumberError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [narration, setNarration] = useState(() => localStorage.getItem('narration') || '')
    const [narrationError, setNarrationError] = useState("")
    const [verifiedAccountData, setVerifiedAccountData] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [transferSuccessfulModal, setTransferSuccessfulModal] = useState(false);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);
    const [transferFailedModal, setTransferFailedModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageError, setPackageError] = useState('');
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const { data: bankListData, error, isLoading } = useGetBankListQuery({ token: storedToken });
    const [verifyBankAccount] = useVerifyBankAccountMutation();
    const [transferFunds] = useTransferFundsMutation();
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

    useEffect(() => {
        // Store amount and number in localStorage
        localStorage.setItem('amount', amount);
        localStorage.setItem('accountNumber', accountNumber);
        localStorage.setItem('narration', narration);
    }, [amount, accountNumber, narration]);

    const handleBack = () => {
        navigate("/home");
    };




    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
    };

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAccountNumber(value);
    };

    const handleNarrationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNarration(value);
    };


    interface Bank {
        name: string;
        code: string;
    }

    interface BankListData {
        data: Bank[];
    }

    const packageOptions: Bank[] = (bankListData as BankListData)?.data.map((bank: Bank) => ({
        name: bank.name,
        code: bank.code
    })) || [];

    const handlePackageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedBank = packageOptions.find(bank => bank.name === e.target.value);
        if (selectedBank) {
            setSelectedPackage(selectedBank.code);
            if (accountNumber) {
                await handleVerifyAccount();
            }
        }
        setPackageError('');
    };

    const handleVerifyAccount = async () => {

        if (!selectedPackage) {
            setPackageError('Please select a bank.');
        }
        if (!accountNumber) {
            setAccountNumberError('Please enter a valid account number.');
        }
        if (accountNumber && selectedPackage) {
            try {
                const response = await verifyBankAccount({ token: storedToken, accountNumber, bankCode: selectedPackage });
                if (response.data.success) {
                    setVerifiedAccountData(response.data.message);
                } else {
                    toast.error('Something went wrong in verifying the account number');
                }
            } catch (err) {
                console.error(err);

            }
        } else {
            setAccountNumberError('Invalid account number.');
            setPackageError('Invalid bank code.');
        }
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!amount) {
            setAmountError('Please enter an amount.');
        }
        if (amount) {
            setAmountError('');
            setNarrationError("")
            try {

                setLoading(true);

                navigate('/pin/transfer/enter', { state: { service: "transfer" } });


            } catch (err) {

                console.error(err);
                toast.error('Transaction failed. Please try again.');
            } finally {

                setLoading(false);
            }
        }
    };


    console.log(accountNumberError)
    const handleCloseModal = async () => {

        try {

            setLoading(true);
            const response = await transferFunds({
                debitAccountNumber: "0119017579",
                token: storedToken,
                nameEnquiryReference: "61e985180e69308aa37a7a94",
                beneficiaryBankCode: selectedPackage,
                beneficiaryAccountNumber: accountNumber,
                amount: parseInt(amount, 10),
                saveBeneficiary: false,
                narration: narration,

            });

            if (response?.data?.success) {
                toast.success(response.data.message);
                setPaymentSuccessfulModal(true);
            } else {
                if (response.error && 'data' in response.error) {
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
            setSelectedPackage("");
            setAccountNumber("");
            setAmount("");
            setNarration("")
            localStorage.setItem('amount', '');
            localStorage.setItem('accountNumber', '');
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
                                <div className='mt-5'>
                                    <p className='text-white font-[500] text-base font-poppins mb-2'>Account Number</p>
                                    <input
                                        type="number"
                                        value={accountNumber}
                                        onChange={handleAccountNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='1711245709'
                                    />
                                    {/* {accountNumberError && <p className='text-[#D45A0E] text-sm text-center'>{accountNumberError}</p>} */}

                                </div>
                                <div className='mt-8'>
                                    <p className='text-white font-[500] text-base font-poppins mb-2'>Select Provider</p>
                                    <div className="relative">
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
                                        <select
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
                                </div>

                                {verifiedAccountData && <p className='text-[#4CAF50] font-[400] text-sm font-poppins mt-3'>{verifiedAccountData}</p>}
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
                        <p className='text-white font-[400]  font-poppins text-sm '>Account Number</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{accountNumber}</p>
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


