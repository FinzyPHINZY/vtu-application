import { useState, useEffect } from 'react';
import DesktopImage from '../assets/images/bold-data.png';
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { CancelIcon, CustomerSupport, LeftArrowIcon, SearchIcon } from '../assets/svg';
import MTN from '../assets/images/mtn.png';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const TransactionHistory = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Record<string, string> | null>(null);
    const storedUser = useSelector((state: RootState) => state.user.user) as { transactions: Record<string, string>[] };

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

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTransaction(null);
    };

    const handleTransactionClick = (transaction: Record<string, string>) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    return (
        <div>
            {isMobileView ? (
                // JSX for screens below 768px
                <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col'>
                    {showModal && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
                    <div className='flex justify-between items-center'>
                        <LeftArrowIcon onClick={handleBack} />
                        <p className='text-white font-[400] text-base font-poppins'>Transactions</p>
                        <div>       </div>
                    </div>
                    <div className='bg-[#1E1E1E] px-5 my-10 rounded-[15px] h-[53px] flex justify-start gap-4 items-center'>
                        <SearchIcon />
                        <input
                            type='text'
                            className='bg-transparent border-none text-white focus:ring-0 flex-grow'
                            placeholder='Search...'
                        />
                    </div>
                    <p className='text-[#FFFFFF8A] font-poppins font-[400] text-sm mb-5'>08 apr 2024</p>
                    <div className="px-2 py-4">

                        {storedUser.transactions.length === 0 ? (
                            <div className='flex justify-start items-center py-5'>
                                <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>No transactions yet</p>
                            </div>
                        ) : (
                            storedUser.transactions.map((transaction, index) => (
                                <div
                                    className='flex justify-between items-center py-5 border-[#FFFFFF21] border-b-[1px]'
                                    key={index}
                                    onClick={() => handleTransactionClick(transaction)}
                                >
                                    <div className='flex justify-start items-center gap-4'>
                                        <img src={MTN} className='w-7 h-7 rounded-xl' />
                                        <div>
                                            <p className='text-white font-[400] text-sm font-poppins '>{`Debit`} - 0905681138</p>
                                            <p className='text-[#FFFFFFA1] font-[400] text-sm font-poppins '>{`N`} {`200`}</p>
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
            {showModal && selectedTransaction && (
                <div className='fixed inset-0 mx-2 bg-[#1E1E1E] h-[450px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'>
                    <div className='flex justify-between items-start'>
                        <div>             </div>
                        <div className='flex flex-col justify-center items-center gap-2'>
                            <img src={MTN} className='w-16 h-16 rounded-xl' />
                            <p className='text-white font-[400] font-poppins text-sm '>{`Debit`} - {`08126442953`}</p>
                        </div>

                        <div onClick={handleCloseModal}>
                            <CancelIcon />
                        </div>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Phone number:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>09056811438</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>$200</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Transaction ID:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>HFHSHFDSUYFY</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Status:</p>
                        <p className='text-[#47BF4C] font-[400] font-poppins text-sm '>Successful</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400] font-poppins text-sm '>Date & Time:</p>
                        <p className='text-white font-[400] font-poppins text-sm '>28/2/24, 13:50pm</p>
                    </div>
                    <div className='flex justify-center gap-4 items-center mt-5'>
                        <CustomerSupport />
                        <p className='text-[#3B8FF0] font-[400] font-poppins text-sm'>Customer Support</p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Buy again</p>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
