import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import MTN from '../assets/images/mtn.png';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ArrowRight, CableIcon, CancelIcon, DataIcon, DepositIcon, ElectricityIcon, HiddenIcon, NotificationIcon, PhoneIcon, ProfileIcon, QuickServiceIcon, RoundedIcon, TransferIcon } from '../assets/svg';
import { useFetchServicesQuery } from '../services/apiService';
import '../App.css'

const Home = () => {
    const storedUser = useSelector((state: RootState) => state.user.user);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    console.log(storedUser, storedToken, 48)
    console.log(storedUser.hasSetTransactionPin)
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    // const storedData = {token: storedToken}
    const { data: servicesData, error, isLoading } = useFetchServicesQuery({ token: storedToken });
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
        console.log(servicesData, error, isLoading);
    }, [servicesData, error, isLoading]);


    // const handleCloseModal = () => {
    //     setShowModal(false);
    //     navigate('/otp');
    // };







    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-3 px-3 max-sm:px-2 flex flex-col justify-start'>
                        {showModal && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}

                        <div className="bg-[#1E1E1E] h-[35%] px-5 py-8 rounded-[15px]">
                            <div className='flex justify-between items-center '>
                                <p className='text-white font-[400] text-lg font-kavoon'>Bold data</p>
                                <div onClick={() => navigate('/profile')}>
                                    <ProfileIcon />
                                </div>
                            </div>
                            <div className='mt-10'>
                                <p className='text-[#FFFFFFB0] font-[400] text-sm font-poppins text-center'> Total balance</p>
                                <div className='flex justify-center items-center gap-1 mt-2'>
                                    <p className='text-[#FFFFFFB2] font-[400] text-base font-kavoon'>$</p>
                                    <p className='text-[#FFFFFF] font-[700] text-2xl font-poppins'>{storedUser.accountBalance}</p>
                                    <HiddenIcon />
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
                                {!storedUser.hasSetTransactionPin &&
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
                                                <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Complete your registration</p>
                                                <p className='text-[#FFFFFFBF] font-[200] text-sm font-poppins'>You need to complete your registration to perform a transaction</p>
                                            </div>
                                        </div>
                                        <div onClick={() => navigate("/verification/complete")}>
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
                            <div className={`flex ${isLoading ? 'justify-center' : 'justify-between'} items-center py-3 mt-5`}>
                                {servicesData && servicesData.data.map((servicedata, index: number) => (
                                    <div className=' flex flex-col justify-center items-center gap-2'
                                        key={index}
                                        onClick={() => {
                                            switch (servicedata.identifier) {
                                                case 'DATA':
                                                    navigate('/data', { state: { data: servicedata._id } });
                                                    break;
                                                case 'AIRTIME':
                                                    navigate('/airtime', { state: { data: servicedata._id } });
                                                    break;
                                                case 'UTILITY':
                                                    navigate('/utility', { state: { data: servicedata._id } });
                                                    break;
                                                case 'CABLETV':
                                                    navigate('/cable', { state: { data: servicedata._id } });
                                                    break;
                                                default:
                                                    navigate('/');
                                                    break;
                                            }
                                        }}
                                    >
                                        {servicedata.identifier === 'DATA' && <DataIcon />}
                                        {servicedata.identifier === 'AIRTIME' && <PhoneIcon />}
                                        {servicedata.identifier === 'CABLETV' && <CableIcon />}
                                        {servicedata.identifier === 'UTILITY' && <ElectricityIcon />}
                                        <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>{servicedata.identifier}</p>
                                    </div>
                                ))}
                                {isLoading &&
                                    <div className='flex justify-center items-center'>
                                        <div className='loader'>
                                            <div className="spinner"></div>
                                        </div>
                                    </div>}

                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                            <div className='flex justify-between items-center mb-5'>

                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Transaction</p>
                                {storedUser.transactions.length > 0 && <p className='text-[#0D7CFF] font-[400] text-sm font-poppins'>See more</p>}

                            </div>
                            {storedUser.transactions.length === 0 ? (
                                <div className='flex justify-start items-center py-5'>
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>No transactions yet</p>
                                </div>
                            ) : (
                                storedUser.transactions.map((transaction, index) => (
                                    <div className='flex justify-between items-center py-5 border-[#FFFFFF21] border-b-[1px]' key={index}>
                                        <div className='flex justify-start items-center gap-4'>
                                            <img src={MTN} className='w-7 h-7 rounded-xl' />
                                            <div>
                                                <p className='text-white font-[400] text-sm font-poppins '>{transaction.type} - 0905681138</p>
                                                <p className='text-[#FFFFFFA1] font-[400] text-sm font-poppins '>{transaction.currency} {transaction.amount}</p>
                                            </div>
                                        </div>
                                        <p className='text-[#D45A0E] font-[400] text-sm font-poppins '>See more</p>
                                    </div>
                                ))
                            )}


                        </div>
                    </div>
                ) : (
                    // JSX for screens above 768px
                    <div className='min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between'>
                        {showModal && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
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
                <div className='fixed bottom-0 inset-x-0 bg-[#1E1E1E] h-[200px] py-5 px-10 z-50 flex justify-start flex-col'>

                    <div className='flex justify-between items-center'>

                        <p className='text-white font-[500]  font-poppins text-base '>Deposit</p>
                        <div onClick={() => setShowModal(false)}>
                            <CancelIcon />
                        </div>

                    </div>
                    <div className='flex justify-between items-center mt-6'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Bank</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{storedUser.accountDetails.bankName || "Pending"}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account number</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{storedUser.accountDetails.accountNumber || "Pending"}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account name:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{storedUser.accountDetails.accountName}</p>
                    </div>
                    {/* <button

                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Confirm payment</p>
                    </button> */}
                </div>
            )}
        </div>
    )
}

export default Home
