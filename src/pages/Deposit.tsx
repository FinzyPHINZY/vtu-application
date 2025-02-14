import { useState, useEffect, useCallback } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
// import MTN from '../assets/images/mtn.png'
import '../App.css'
import {
    useGetUserDetailsMutation,
    useGetVirtualTransactionMutation,
} from '../services/apiService';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate, useLocation } from 'react-router-dom';


const Deposit = () => {
    const dispatch = useDispatch();
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();

    const storedToken = useSelector((state: RootState) => state.auth.token);

    const [getVirtualTransaction] = useGetVirtualTransactionMutation();

    const location = useLocation();
    const {
        accountName,
        accountNumber,
        bankName,
        amountToPay,
        sessionId,
    } = location.state || {};
    // const [sessionId2, setSessionId] = useState("");
    // const [bankName2, setBankName] = useState('');
    // const [accountNumber2, setAccountNumber] = useState('');
    // const [accountName2, setAccountName] = useState('');
    // const [amountToPay2, setAmountToPay] = useState('');
    const [timeLeft, setTimeLeft] = useState(600);
    const [getUserDetails] = useGetUserDetailsMutation();
    console.log(
        accountName,
        accountNumber,
        bankName,
        amountToPay,
        sessionId,
        60000
    )




    useEffect(() => {

        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };


        handleResize();


        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };


    const closeModal2 = useCallback(async () => {
        const checkTransactionStatus = async () => {
            const response = await getVirtualTransaction({ token: storedToken, id: sessionId });
            console.log(sessionId, response?.data?.data, 56)
            if (response?.data?.data?.status == 'Completed') {
                toast.success(response.data.message);
                console.log("completed", response?.data?._id)
                const userDetails = await getUserDetails({ token: storedToken })
                dispatch(setUserInfo(userDetails.data));
                navigate("/home");
                return

            } else if (response?.data?.data?.status === 'Pending') {
                console.log("pending", response?.data?._id)
                toast.info('Payment is still pending. Please wait for three minutes...');
                return;



            } else if (response.error && 'data' in response.error) {
                console.log((response.error.data as { message: string }).message);
                const errorMessage = (response.error.data as { message: string }).message
                toast.error(errorMessage);
                navigate("/home");
                return


            }
            // return false;
            toast.error('No transaction found. Please try again');
            navigate("/home");
        };

        try {
            await checkTransactionStatus();

        } catch (error) {
            console.error('Error checking transaction status:', error);
            toast.error('An error occurred while checking transaction status');

        }
    }, [getVirtualTransaction, getUserDetails, dispatch, sessionId, storedToken, navigate]); // Added dependencies

    useEffect(() => {
        const timer = setInterval(async () => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
            if (timeLeft <= 0) {
                clearInterval(timer); 
                await closeModal2(); 
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [timeLeft, closeModal2]);





    return (

        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-start gap-2'>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={closeModal2} />


                            <div>             </div>

                        </div>
                        <p className='text-white font-[500]  font-poppins text-center text-base my-4'>Transfer to this account details below</p>
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
                        <p className='text-[#D45A0E] font-[500]  font-poppins text-center text-base my-4'>Disclaimer: Do not close this page after the transaction until the timer elapse</p>
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

export default Deposit
