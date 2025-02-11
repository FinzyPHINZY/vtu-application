import React, { useState, useEffect } from 'react';
import DesktopImage from '../assets/images/bold-data.png';
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { CancelIcon, CustomerSupport, LeftArrowIcon, SearchIcon } from '../assets/svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useGetAllTransactionsQuery } from '../services/apiService';
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import '../App.css'
import { IoMdClose } from "react-icons/io";

const TransactionHistory = () => {
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
            mobile_number?: string;
            debitAccountNumber?: string;
            beneficiaryAccount?: string;
            beneficiaryBank?: string;
            nameEnquiryReference?: string;
            smart_card_number?: string;
            meter_number?: string;
            meterType?: string;

        };
        user: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const openTawkToChat = () => {
        if (window.Tawk_API && window.Tawk_API.maximize) {
            window.Tawk_API.maximize();
        }
    };

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: `${year}`, label: `${year}` };
    });

    const months = React.useMemo(() => [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ], []);

    // const days = Array.from({ length: 31 }, (_, i) => ({
    //     value: `${i + 1}`.padStart(2, '0'),
    //     label: `${i + 1}`
    // }));

    const [selectedYear, setSelectedYear] = useState(() => {
        const currentYear = new Date().getFullYear().toString();
        return years.find(y => y.value === currentYear)?.label || '';
    });

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return months.find(m => m.value === currentMonth)?.label || '';
    });

    const days = React.useMemo(() => {
        const getDaysInMonth = (month: string, year: string) => {
            return new Date(parseInt(year), parseInt(month), 0).getDate();
        };

        const selectedMonthValue = months.find(m => m.label === selectedMonth)?.value || '01';
        const selectedYearValue = years.find(y => y.label === selectedYear)?.value || new Date().getFullYear().toString();

        const daysInMonth = getDaysInMonth(selectedMonthValue, selectedYearValue);

        return Array.from({ length: daysInMonth }, (_, i) => ({
            value: `${i + 1}`.padStart(2, '0'),
            label: `${i + 1}`
        }));
    }, [selectedMonth, selectedYear, months, years]);



    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);


    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');


    const [selectedDay, setSelectedDay] = useState(() => {
        const currentDay = new Date().getDate().toString().padStart(2, '0');
        return days.find(d => d.value === currentDay)?.label || '';
    });

    const storedToken = useSelector((state: RootState) => state.auth.token);
    const {
        data: transactionsResponse,
        isLoading,
        error
    } = useGetAllTransactionsQuery({ token: storedToken });
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

    const handleBack = () => {
        navigate(-1);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTransaction(null);
        navigate("/home")
    };

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    // const filteredTransactions = transactions.filter((transaction: Transaction) => {
    //     const dateMatch = (selectedYear === '' || transaction.createdAt.includes(selectedYear)) &&
    //                      (selectedMonth === '' || transaction.createdAt.includes(`-${months.find(m => m.label === selectedMonth)?.label || 'Jan'}-`)) &&
    //                      (selectedDay === '' || transaction.createdAt.endsWith(`-${selectedDay}`));
    //     const searchMatch = searchQuery || (transaction.type || transaction.metadata.phoneNumber || transaction.amount.toString() || '').toLowerCase().includes(searchQuery.toLowerCase());

    //     return  dateMatch && searchMatch;
    // });

    // const filteredTransactions = transactions.filter((transaction: Transaction) => {
    //     const searchMatch = searchQuery.toLowerCase();
    //     const typeMatch = (transaction.type || '').toLowerCase().includes(searchMatch);
    //     const phoneNumberMatch = (transaction.metadata.phoneNumber || '').toLowerCase().includes(searchMatch);
    //     const amountMatch = transaction.amount.toString().includes(searchMatch);

    //     return typeMatch || phoneNumberMatch || amountMatch;
    // });

    const filteredTransactions = transactions.filter((transaction: Transaction) => {
        const createdAt = new Date(transaction.createdAt);

        // const selectedYearMatch = selectedYear === '' || createdAt.getFullYear().toString() === selectedYear;

        // const selectedMonthMatch = selectedMonth === '' || createdAt.toLocaleString('en-US', { month: 'short' }) === selectedMonth;

        // const selectedDayMatch = selectedDay === '' || createdAt.getDate().toString().padStart(2, '0') === selectedDay;

        const dateMatch = createdAt.getDate().toString() == selectedDay && createdAt.toLocaleString('en-US', { month: 'short' }) == selectedMonth.slice(0, 3) && createdAt.getFullYear().toString() == selectedYear;

        const searchMatch = searchQuery.toLowerCase();
        const typeMatch = (transaction.type || '').toLowerCase().includes(searchMatch);
        const phoneNumberMatch = (transaction?.metadata?.mobile_number || '').toLowerCase().includes(searchMatch);
        const amountMatch = transaction.amount.toString().includes(searchMatch);
        console.log(createdAt.getDate().toString() == selectedDay, createdAt.toLocaleString('en-US', { month: 'short' }) == selectedMonth.slice(0, 3), createdAt.getFullYear().toString() == selectedYear, transactions.length)
        return dateMatch && (typeMatch || phoneNumberMatch || amountMatch);
    });




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
                            className='bg-transparent border-none text-white focus:ring-0 flex-grow outline-none'
                            placeholder='Search...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className='flex gap-2 items-center mb-5'>
                        {/* <select
                            className='bg-[#1E1E1E] text-white outline-none py-2 px-4 rounded-[10px]'
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select> */}
                        <div className="relative">
                            <select
                                value={years.find(y => y.label === selectedYear)?.value || ''}
                                onChange={(e) => setSelectedYear(years.find(y => y.value === e.target.value)?.label || '')}
                                className='py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none'
                            >
                                {years.map(year => (
                                    <option key={year.value} value={year.value}>
                                        {year.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                                <svg className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M10 12l-6-6h12l-6 6z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={months.find(m => m.label === selectedMonth)?.value || ''}
                                onChange={(e) => setSelectedMonth(months.find(m => m.value === e.target.value)?.label || '')}
                                className='py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none'
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                                <svg className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M10 12l-6-6h12l-6 6z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={days.find(d => d.label === selectedDay)?.value || ''}
                                onChange={(e) => setSelectedDay(days.find(d => d.value === e.target.value)?.label || '')}
                                className='py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none'
                            >
                                {days.map(day => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                                <svg className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M10 12l-6-6h12l-6 6z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-4 ${(isLoading || error) ? 'justify-center flex items-center' : ''} `}>
                        {isLoading ?
                            <div className='flex justify-center items-center'>
                                <div className='loader'>
                                    <div className="spinner"></div>
                                </div>
                            </div> :

                            filteredTransactions.length === 0 ? (
                                <div className='flex justify-start items-center py-5'>
                                    <p className='text-[#FFFFFF] font-[400] text-sm font-poppins'>No transactions yet</p>
                                </div>
                            ) : (
                                filteredTransactions.map((transaction: Transaction, index: number) => {
                                    console.log(transaction);
                                    return (
                                        <div
                                            className='flex justify-between items-center py-5 border-[#FFFFFF21] border-b-[1px]'
                                            key={index}
                                            onClick={() => handleTransactionClick(transaction)}
                                        >
                                            <div className='flex justify-start items-center gap-4'>

                                            {transaction.status == "failed" ? <IoMdClose className='text-[#D45A0E] h-6 w-6'/> :
                                                        transaction.type == "debit" ? <FaLongArrowAltUp className='w-7 h-7 text-[#D45A0E]  ' />
                                                            : <FaLongArrowAltDown className='w-7 h-7 text-[#D45A0E] ' />
                                                    }
                                                <div>
                                                    <p className='text-white font-[400] text-sm font-poppins '>{transaction.type} - {transaction.serviceType}</p>
                                                    <p className='text-[#FFFFFFA1] font-[400] text-sm font-poppins '>{transaction.currency} {transaction.amount}</p>
                                                    <p className={`${transaction.status == "failed" ? "text-red-500" :"text-[#47BF4C]"} font-[400] text-sm font-poppins `}>Transaction {transaction.status}</p>
                                                </div>
                                            </div>
                                            <p className='text-[#D45A0E] font-[400] text-sm font-poppins '>See more</p>
                                        </div>
                                    )
                                })

                            )

                        }

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
                <div className='fixed inset-0 mx-2 bg-[#1E1E1E] h-[500px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col'>
                    <div className='flex justify-between items-start'>
                        <div>             </div>
                        <div className='flex flex-col justify-center items-center gap-2'>
                            <GrTransaction className='h-8 w-8 text-[white]' />
                            <p className='text-white font-[400] font-poppins text-sm '>{selectedTransaction.serviceType}</p>
                        </div>

                        <div onClick={() => { setShowModal(false); setSelectedTransaction(null) }}>
                            <CancelIcon   />
                        </div>
                    </div>
                    {/* {(selectedTransaction.serviceType == "airtime" || selectedTransaction.serviceType == "data") &&
                        <div className='flex justify-between items-center mt-4'>
                            <p className='text-white font-[400]  font-poppins text-sm '>Phone number:</p>
                            <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.metadata.mobile_number}</p>
                        </div>} */}
                    {(selectedTransaction.serviceType == "bank_transfer") &&
                        <div className='flex justify-between items-center mt-4'>
                            <p className='text-white font-[400]  font-poppins text-sm '>Beneficiary number:</p>
                            <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.metadata.beneficiaryAccount}</p>
                        </div>}

                    {(selectedTransaction.serviceType == "tvSubscription") &&
                        <div className='flex justify-between items-center mt-4'>
                            <p className='text-white font-[400]  font-poppins text-sm '>smart card number:</p>
                            <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.metadata.smart_card_number}</p>
                        </div>}

                    {(selectedTransaction.serviceType == "electricity") &&
                        <div className='flex justify-between items-center mt-4'>
                            <p className='text-white font-[400]  font-poppins text-sm '>meter number:</p>
                            <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.metadata.meter_number}</p>
                        </div>}

                    {(selectedTransaction.serviceType == "electricity") &&
                        <div className='flex justify-between items-center mt-4'>
                            <p className='text-white font-[400]  font-poppins text-sm '>meter type:</p>
                            <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.metadata.meterType}</p>
                        </div>}
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{selectedTransaction.amount}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-[12px] '>Transaction ID:</p>
                        <p className='text-white font-[400]  font-poppins text-[12px] '>{selectedTransaction.reference}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Status:</p>
                        <p className={`${selectedTransaction.status == "failed" ? "text-red-500" :"text-[#47BF4C]"} font-[400] font-poppins text-sm `}>{selectedTransaction.status}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400] font-poppins text-sm '>Date & Time:</p>
                        <p className='text-white font-[400] font-poppins text-sm '>{formatDate(selectedTransaction?.createdAt || '')}</p>
                    </div>
                    <div className='flex justify-center gap-4 items-center mt-5' onClick={openTawkToChat}>
                        <CustomerSupport />
                        <p className='text-[#3B8FF0] font-[400] font-poppins text-sm'>Customer Support</p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Transact again</p>
                    </button>
                </div>

            )
            }
        </div >
    );
};

export default TransactionHistory;
