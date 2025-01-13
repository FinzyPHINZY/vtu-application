import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import MTN from '../assets/images/mtn.png'
import { ArrowRight, CableIcon, CancelIcon, DataIcon, DepositIcon, ElectricityIcon, HiddenIcon, NotificationIcon, PhoneIcon, ProfileIcon, QuickServiceIcon, RoundedIcon, TransferIcon } from '../assets/svg';


const Home = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {

        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };


        handleResize();


        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);



    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/otp');
    };







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
                                <div onClick={() => setShowModal(true)}>
                                    <ProfileIcon />
                                </div>
                            </div>
                            <div className='mt-10'>
                                <p className='text-[#FFFFFFB0] font-[400] text-sm font-poppins text-center'> Total balance</p>
                                <div className='flex justify-center items-center gap-1 mt-2'>
                                    <p className='text-[#FFFFFFB2] font-[400] text-base font-kavoon'>$</p>
                                    <p className='text-[#FFFFFF] font-[700] text-2xl font-poppins'>400.00</p>
                                    <HiddenIcon />
                                </div>
                            </div>
                            <div className='flex justify-between items-center  mt-10'>
                                <div className='bg-[#595959] h-14 w-[42%] rounded-[10px] flex justify-center items-center gap-3'>
                                    <DepositIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Deposit</p>
                                </div>
                                <div className='bg-[#D45A0E] h-14 w-[42%] rounded-[10px] flex justify-center items-center gap-3'>
                                    <TransferIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Deposit</p>
                                </div>

                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                            <div className='flex justify-start items-center gap-4'>
                                <NotificationIcon />
                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Notification</p>
                            </div>
                            <div className='flex justify-between items-center mt-5'>
                                <div className='flex justify-start items-center gap-4'>
                                    <RoundedIcon />
                                    <div>
                                        <p className='text-[#FFFFFF] font-[400] text-base font-poppins'>Set transaction pin</p>
                                        <p className='text-[#FFFFFFBF] font-[200] text-sm font-poppins'>You need to set transaction pin to perform trans ..</p>
                                    </div>
                                </div>
                                <ArrowRight />
                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                            <div className='flex justify-start items-center gap-4'>
                                <QuickServiceIcon />
                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Quick service</p>
                            </div>
                            <div className='flex justify-between items-center py-3 mt-5 '>
                                <div className=' flex flex-col justify-center items-center'>
                                    <DataIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Data</p>
                                </div>
                                <div className=' flex flex-col justify-center items-center'>
                                    <PhoneIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Airtime</p>
                                </div>
                                <div className=' flex flex-col justify-center items-center'>
                                    <CableIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Cable</p>
                                </div>
                                <div className=' flex flex-col justify-center items-center'>
                                    <ElectricityIcon />
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Electricity</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1E1E1E] h-[20%] px-5 py-4 rounded-[15px] mt-3">
                            <div className='flex justify-between items-center mb-5'>

                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>Transaction</p>
                                <p className='text-[#0D7CFF] font-[400] text-sm font-poppins'>See more</p>
                            </div>
                            <div className='flex justify-between items-center py-5 border-[#FFFFFF21] border-b-[1px]'>
                                <div className='flex justify-start items-center gap-4'>
                                    <img src={MTN} className='w-7 h-7 rounded-xl' />
                                    <div>
                                        <p className='text-white font-[400] text-sm font-poppins '>MTN 2GB- 0905681138</p>
                                        <p className='text-[#FFFFFFA1] font-[400] text-sm font-poppins '>$200</p>
                                    </div>
                                </div>
                                <p className='text-[#D45A0E] font-[400] text-sm font-poppins '>See more</p>
                            </div>

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
                <div className='fixed bottom-0 inset-x-0 bg-[#1E1E1E] h-[350px] py-5 px-10 z-50 flex justify-between flex-col'>

                    <div className='flex justify-between items-center'>

                        <p className='text-white font-[500]  font-poppins text-base '>Deposit</p>
                        <div onClick={() => setShowModal(false)}>
                            <CancelIcon />
                        </div>

                    </div>
                    <div className='flex justify-between items-center mt-6'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Bank</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>Opay</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account number</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>09056811438</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Account name:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>Cruise ad</p>
                    </div>
                    <button

                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Confirm payment</p>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Home
