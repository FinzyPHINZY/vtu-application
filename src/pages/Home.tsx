import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
// import MTN from '../assets/images/mtn.png';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Circles } from 'react-loader-spinner';
import {
    ArrowRight,
    CableIcon,
    CancelIcon,
    DataIcon,
    DepositIcon,
    ElectricityIcon,
    //  HiddenIcon, 
    NotificationIcon,
    PhoneIcon, ProfileIcon, QuickServiceIcon, RoundedIcon, TransferIcon
} from '../assets/svg';
import '../App.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
    useGetAllTransactionsQuery,
    useGetUserDetailsQuery,
    useCreateVirtualAccountMutation,
    useGetVirtualTransactionMutation,
} from '../services/apiService';
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';
import { toast } from 'react-toastify';
import { IoMdClose } from "react-icons/io";

const Home = () => {
    const storedUser = useSelector((state: RootState) => state.user.user);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const [accountBalanceHidden, setAccountBalanceHidden] = useState(false);
    const [getVirtualTransaction] = useGetVirtualTransactionMutation();
    console.log(storedUser, storedToken, storedPin, 48)
    console.log(storedUser.hasSetTransactionPin)
    console.log(storedUser.accountDetails.status)
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [amount, setAmount] = useState('')
    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [amountToPay, setAmountToPay] = useState('');
    const [timeLeft, setTimeLeft] = useState(600);
    const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetailsQuery({ token: storedToken });
  

    useEffect(() => {
        let attempt = 0;
        const timer = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
    
        const interval = setInterval(() => {
          
                const fetchTransaction = async () => {
                    if (attempt < 10) {
                        attempt++;
                        const response = await getVirtualTransaction({ token: storedToken, id: sessionId });
                        if (response?.data?.status === 'Completed') {
                            clearInterval(interval);
                            toast.success(response.data.message);
                            refetchUserDetails();
                            dispatch(setUserInfo(userDetails.data));
                            return
                        } else if (response?.data?.status === 'Pending') {
                            toast.info('Payment is still pending. Please wait...');
                        } else if (response?.data?.status === 'error' && response?.data?.code === 400) {
                            clearInterval(interval);
                            toast.error('No transaction found. Please try again.');
                        }
                    } else {
                        clearInterval(interval);
                        toast.error('No transaction found. Please try again.');
                    }
                };
                fetchTransaction();
         
        }, 180000); // 3 minutes in milliseconds
    
        return () => {
            clearInterval(timer);
            clearInterval(interval);
        };
    }, [showModal2, timeLeft, sessionId, storedToken, getVirtualTransaction, refetchUserDetails, dispatch, userDetails]);
    
    const closeModal2 = async () => {
        setShowModal2(false);
        const response = await getVirtualTransaction({ token: storedToken, id: sessionId });
        if (response?.data?.status === 'Completed') {
            toast.success(response.data.message);
            refetchUserDetails();
        } else if (response?.data?.status === 'Pending') {
            toast.info('Payment is still pending. Please wait...');
        } else if (response?.data?.status === 'error' && response?.data?.code === 400) {
            toast.error('No transaction found. Please try again.');
        }
        dispatch(setUserInfo(userDetails.data));
    };
    


    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    // const storedData = {token: storedToken}
    const {
        data: transactionsResponse,
        isLoading: isLoading2,
        error: error2
    } = useGetAllTransactionsQuery({ token: storedToken });

    // const { data: userDetails } = useGetUserDetailsQuery({ token: storedToken });
    const [createVirtualAccount] = useCreateVirtualAccountMutation();
    const transactions = transactionsResponse?.transactions || [];
    useEffect(() => {

        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };


        handleResize();


        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);


    const toggleAccountBalance = () => {
        setAccountBalanceHidden(!accountBalanceHidden);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);

    };

    // const handleCloseModal = () => {
    //     setShowModal(false);
    //     navigate('/otp');
    // };
    const handleSubmitButton = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!amount) {
            return;
        }
        try {
            setLoading(true);
            const response = await createVirtualAccount({
                amount: parseInt(amount, 10),
                token: storedToken
            });
    
            if (response?.data?.success) {
                toast.success(response.data.message);
                setAccountName(response.data.data.accountName);
                setAccountNumber(response.data.data.accountNumber);
                setBankName("SAFE HAVEN MFB");
                setAmountToPay(response.data.data.amount);
                setSessionId(response.data._id);
                setShowModal2(true);
            } else {
                if (response.error) {
                    if ('status' in response.error && response.error.status === 504) {
                        toast.error("Gateway error. Please log back in, and try again.");
                    } else if ('data' in response.error) {
                        console.log((response.error.data as { message: string }).message);
                        const errorMessage = (response.error.data as { message: string }).message;
                        toast.error(errorMessage);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.error((error as { data: { message: string } })?.data?.message);
        } finally {
            setAmount("");
            setSelectedAmount("");
            setLoading(false);
            setShowModal(false);
        }
    };
    

    type Transaction = {
        _id: string;
        reference: string;
        serviceType: string;
        type: string;
        amount: number;
        currency: string;
        status: string;
        metadata: {
            serviceCategoryId?: string;
            phoneNumber?: string;
            debitAccountNumber?: string;
            beneficiaryAccountNumber?: string;
            beneficiaryBankCode?: string;
            nameEnquiryReference?: string;
        };
        user: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };





    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-3 px-3 max-sm:px-2 flex flex-col justify-start'>
                        {(showModal || showModal2) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}

                        <div className="bg-[#1E1E1E] h-[35%] px-5 py-8 rounded-[15px]">
                            <div className='flex justify-between items-center '>
                                <div className='flex justify-start gap-2 items-center'>
                                    <div onClick={() => navigate('/profile')}>
                                        <ProfileIcon />
                                    </div>
                                    <p className={`text-[#FFFFFF] font-[400] ${storedUser.firstName ? 'text-sm' : 'text-[12px]'} font-poppins`}>Hi, {storedUser.firstName}</p>
                                </div>
                                <p className='text-[#FFFFFF] font-[400] text-lg font-poppins'>Bold data</p>

                            </div>
                            <div className='mt-10'>
                                <p className='text-[#FFFFFFB0] font-[400] text-sm font-poppins text-center'> Total balance</p>
                                <div className='flex justify-center items-center gap-1 mt-2'>
                                    <p className='text-[#FFFFFFB2] font-[400] text-base font-kavoon'>N</p>
                                    <p className='text-[#FFFFFF] px-2 font-[700] text-2xl font-poppins'>
                                        {accountBalanceHidden ? '***' : storedUser.accountBalance}
                                    </p>
                                    <div onClick={toggleAccountBalance}>
                                        {accountBalanceHidden ? <FaEyeSlash color="#FFFFFF" /> : <FaEye color="#FFFFFF" />}
                                        {/* <HiddenIcon /> */}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-between items-center  mt-10'>
                                <div className='bg-[#595959] h-14 w-[42%] rounded-[10px] flex justify-center items-center gap-3' onClick={() => setShowModal(true)}>
                                    <DepositIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Deposit</p>
                                </div>
                                <div className='bg-[#D45A0E] h-14 w-[42%] rounded-[10px] flex justify-center items-center gap-3' onClick={() => navigate('/transfer')}>
                                    <TransferIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Transfer</p>
                                </div>

                            </div>
                        </div>
                        {(!storedUser.hasSetTransactionPin || storedUser.accountDetails.status == "Pending") &&
                            <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                                <div className='flex justify-start items-center gap-4'>
                                    <NotificationIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Notification</p>
                                </div>
                                {(!storedUser.hasSetTransactionPin) &&
                                    <div className='flex justify-between items-center mt-5'>

                                        <div className='flex justify-start items-center gap-4'>
                                            <RoundedIcon />
                                            <div>
                                                <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Set transaction pin</p>
                                                <p className='text-[#FFFFFFBF] font-[200] text-sm font-poppins'>You need to set transaction pin to perform a transaction</p>
                                            </div>
                                        </div>
                                        <div onClick={() => navigate("/pin/create")}>
                                            <ArrowRight />
                                        </div>
                                    </div>
                                }
                                {storedUser.accountDetails.status == "Pending" &&
                                    <div className='flex justify-between items-center mt-5'>

                                        <div className='flex justify-start items-center gap-4'>
                                            <RoundedIcon />
                                            <div>
                                                <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>KYC</p>
                                                <p className='text-[#FFFFFFBF] font-[200] text-sm font-poppins'>You need to do KYC to get a permanent account</p>
                                            </div>
                                        </div>
                                        <div onClick={() => navigate("/verification/initiate")}>
                                            <ArrowRight />
                                        </div>
                                    </div>
                                }

                            </div>
                        }

                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                            <div className='flex justify-start items-center gap-4'>
                                <QuickServiceIcon />
                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Quick service</p>
                            </div>
                            <div className={`flex  justify-between items-center py-3 mt-5`}>

                                <div className=' flex flex-col justify-center items-center gap-2'
                                    onClick={() => navigate('/data')}

                                >
                                    <DataIcon />

                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Data</p>
                                </div>

                                <div className=' flex flex-col justify-center items-center gap-2'
                                    onClick={() => navigate('/airtime')}

                                >
                                    <PhoneIcon />

                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Airtime</p>
                                </div>
                                <div className=' flex flex-col justify-center items-center gap-2'
                                    onClick={() => navigate('/cable')}

                                >
                                    <CableIcon />

                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>CableTv</p>
                                </div>

                                <div className=' flex flex-col justify-center items-center gap-2'
                                    onClick={() => navigate('/utility')}

                                >
                                    <ElectricityIcon />

                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Utility</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3 mb-5">
                            <div className='flex justify-between items-center '>

                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Transaction</p>
                                {transactions.length > 0 &&
                                    <p className='text-[#0D7CFF] font-[400] text-sm font-poppins' onClick={() => navigate("/transactions")}>See more</p>}

                            </div>
                            <div className={`px-2 py-4 ${(isLoading2 || error2) ? 'justify-center flex items-center' : ''} `}>
                                {isLoading2 ?
                                    <div className='flex justify-center items-center'>
                                        <div className='loader'>
                                            <div className="spinner"></div>
                                        </div>
                                    </div> :
                                    transactions.length === 0 ? (
                                        <div className='flex justify-start items-center py-5'>
                                            <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>No transactions yet</p>
                                        </div>
                                    ) : (
                                        transactions.slice(0, 3).map((transaction: Transaction, index: number) => (
                                            <div className='flex justify-between items-center py-5 border-[#FFFFFF21] border-b-[1px]' key={index}>
                                                <div className='flex justify-start items-center gap-4'>
                                                    {/* <img src={MTN} className='w-7 h-7 rounded-xl' /> */}
                                                    {transaction.status == "failed" ? <IoMdClose className='text-[#D45A0E] h-6 w-6' /> :
                                                        transaction.type == "debit" ? <FaLongArrowAltUp className='w-7 h-7 text-[#D45A0E]  ' />
                                                            : <FaLongArrowAltDown className='w-7 h-7 text-[#D45A0E] ' />
                                                    }


                                                    <div>
                                                        <p className='text-white font-[400] text-sm font-poppins '>{transaction.type} - {transaction.serviceType}</p>
                                                        <p className='text-[#FFFFFFA1] font-[400] text-sm font-poppins '>{transaction.currency} {transaction.amount}</p>
                                                        <p className={`${transaction.status == "failed" ? "text-red-500" : "text-[#47BF4C]"} font-[400] text-sm font-poppins `}>Transaction {transaction.status}</p>
                                                    </div>
                                                </div>
                                                <p className='text-[#D45A0E] font-[400] text-sm font-poppins ' onClick={() => navigate("/transactions")}>See more</p>
                                            </div>
                                        ))
                                    )}

                            </div>
                        </div>
                    </div>
                ) : (
                    // JSX for screens above 768px
                    <div className='min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between'>
                        {(showModal || showModal2) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
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
                <div className='fixed bottom-0 inset-x-0 bg-[#1E1E1E] h-[500px] py-5 px-10 z-50 flex justify-start flex-col'>

                    <div className='flex justify-between items-center'>

                        <p className='text-white font-[500]  font-poppins text-base '>Deposit</p>
                        <div onClick={() => { setShowModal(false); }}>
                            <CancelIcon />
                        </div>

                    </div>

                    <div
                        onClick={() => { setShowModal(false); navigate("/verification/initiate") }}
                        className="scrolling-text text-white font-poppins text-lg mt-6 flex items-center justify-start"> {`Get a permanent Bank Account`}</div>

                    <p className='text-white font-[400]  font-poppins text-sm mt-6 mb-3 text-center '>Quick Deposit</p>

                    <div className=''>


                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                            placeholder='N Enter Amount'
                        />


                    </div>
                    <div className='flex justify-between flex-wrap items-center py-3 mt-5'>
                        <div
                            className={`flex flex-col mt-2 rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '100' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('100');
                                setSelectedAmount('100');
                            }}>
                            <div className=" ">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>100</p>
                            </div>
                        </div>
                        <div
                            className={`flex flex-col mt-2 rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '200' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('200');
                                setSelectedAmount('200');
                            }}>
                            <div className="">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>200</p>
                            </div>
                        </div>
                        <div
                            className={`flex flex-col mt-2 rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '500' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('500');
                                setSelectedAmount('500');
                            }}>
                            <div className="">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>500</p>
                            </div>
                        </div>
                        <div
                            className={`flex mt-2 flex-col rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '1000' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('1000');
                                setSelectedAmount('1000');
                            }}>
                            <div className="">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>1000</p>
                            </div>
                        </div>

                        <div
                            className={`flex mt-2 flex-col rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '2000' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('2000');
                                setSelectedAmount('2000');
                            }}>
                            <div className="">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>2000</p>
                            </div>
                        </div>

                        <div
                            className={`flex mt-2 flex-col rounded-xl border h-10 w-[30%] justify-center items-center gap-2 cursor-pointer ${selectedAmount === '5000' ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                            onClick={() => {
                                setAmount('5000');
                                setSelectedAmount('5000');
                            }}>
                            <div className="">
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>5000</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmitButton}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                            :
                            <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Fund your Wallet</p>
                        }


                    </button>
                </div>
            )}

            {showModal2 && (
                <div className='fixed bottom-0 inset-x-0 bg-[#1E1E1E] h-[300px] py-5 px-10 flex z-50 justify-between flex-col'>
                    <div className='flex justify-between items-center'>
                        <div>             </div>
                        <p className='text-white font-[500]  font-poppins text-base '>Deposit</p>
                        <div onClick={closeModal2}>
                            <CancelIcon />
                        </div>

                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount to Pay</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{amountToPay}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Bank Name:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{bankName}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account Number:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{accountNumber}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account Name:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{accountName}</p>
                    </div>
                    <div
                        className='bg-[#D45A0E] h-10 mt-5 w-full rounded-[25px] flex flex-col justify-center items-center '>

                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Expires in {formatTime(timeLeft)} </p>


                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
