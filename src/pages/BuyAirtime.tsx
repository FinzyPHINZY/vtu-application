import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import { useFetchServiceByIdQuery, useFetchServiceCategoriesQuery, usePurchaseAirtime2Mutation } from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { CancelIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import BackgroundImage from '../assets/images/background.png'

const BuyAirtime = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [amount, setAmount] = useState(() => localStorage.getItem('amount') || '')
    const [amountError, setAmountError] = useState('');
    const [number, setNumber] = useState(() => localStorage.getItem('number') || '')
    const [numberError, setNumberError] = useState('');
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [purchaseAirtime2] = usePurchaseAirtime2Mutation();
    const { data: serviceDataId, secondData } = location.state || {};
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);


    const { data: servicesByIdData } = useFetchServiceByIdQuery({ token: storedToken, id: "61e985180e69308aa37a7a94" });
    const { data: servicesByCategoryData } = useFetchServiceCategoriesQuery({ token: storedToken, id: "61e985180e69308aa37a7a94" });
    useEffect(() => {
        console.log(serviceDataId, servicesByCategoryData, servicesByIdData,);
    }, [serviceDataId, servicesByCategoryData, servicesByIdData,]);



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
        navigate('/home');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        setAmountError('');
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);



    };

    useEffect(() => {
        if (secondData) {
            setShowModal(true);
        }
    }, [secondData]);

    useEffect(() => {
        // Store amount and number in localStorage
        localStorage.setItem('amount', amount);
        localStorage.setItem('number', number);
    }, [amount, number]);


    const handleSubmitButton = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await purchaseAirtime2({
                serviceCategoryId: "61e985180e69308aa37a7a94",
                amount: parseInt(amount, 10),
                channel: "WEB",
                debitAccountNumber: "0119017579",
                phoneNumber: number,
                statusUrl: "https://finzyphinzy.vercel.app",
                transactionPin: storedPin,
                token: storedToken
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
        } finally {
            setAmount("");
            setNumber("");
            localStorage.setItem('amount', '');
            localStorage.setItem('number', '');
            setLoading(false);
            setShowModal(false)
        }

    };

    const handleCloseModal = async () => {
        if (!amount) {
            setAmountError('Please enter a valid amount.');
        }
        if (!number) {
            setNumberError('Please enter a valid phone number');
        }

        setLoading(true);
        if (amount && number) {
            setAmountError('');
            setNumberError('');

            navigate('/pin/airtime/enter', { state: { service: "airtime", amount: amount, number: number } });
            setLoading(false);
        } else {
            setAmountError('Please enter a valid amount.');
            setNumberError('Please enter a valid phone number');
        }
    };

    interface ServiceData {
        logoUrl: string;
        name: string;
        identifier: string;
    }

    const handleItemClick = (servicedata: ServiceData) => {
        setSelectedService(servicedata);
    };

    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Airtime</p>
                            <div>       </div>
                        </div>
                        <div className='flex justify-between items-center py-3 mt-10 '>
                            {servicesByCategoryData && servicesByCategoryData.data.map((servicedata: ServiceData, index: number) => {
                                console.log(servicedata.logoUrl, 40004);
                                return (
                                    <div className=' flex flex-col justify-center items-center gap-2'
                                        key={index}
                                        onClick={() => handleItemClick(servicedata)}>
                                        {servicedata.identifier === 'MTN' &&
                                            <div className="card">
                                                <img src={servicedata.logoUrl} alt={servicedata.name} />
                                            </div>
                                        }
                                        {servicedata.identifier === 'GLO' &&
                                            <div className="card">
                                                <img src={servicedata.logoUrl} alt={servicedata.name} />
                                            </div>
                                        }
                                        {servicedata.identifier === 'AIRTEL' &&
                                            <div className="card">
                                                <img src={servicedata.logoUrl} alt={servicedata.name} />
                                            </div>
                                        }
                                        {servicedata.identifier === 'ETISALAT' &&
                                            <div className="card">
                                                <img src={servicedata.logoUrl} alt={servicedata.name} />
                                            </div>
                                        }

                                    </div>
                                )
                            })}



                        </div>
                        {selectedService && (
                            <div className='w-full p-4 mt-4 border-t border-gray-200 flex flex-col justify-center items-start'>
                                <div className='flex flex-col  items-center'>
                                    <p className='text-white font-[400] text-base font-poppins mb-3'>Selected Service:</p>
                                    <div className="items-center flex flex-col gap-2">
                                        <div className="card ">
                                            <img src={selectedService.logoUrl} alt={selectedService.name} className="w-15 h-15 rounded-xl" />

                                        </div>
                                        <p className='text-white'>{selectedService.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <form className='mt-20 flex-grow flex flex-col justify-between pb-20'>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Amount</p>

                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='300'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}

                                </div>
                                <div className='mt-12'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Phone number</p>
                                    <input
                                        type="number"
                                        value={number}
                                        onChange={handleNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='1234567890'
                                    />
                                    {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
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
                        <p className='text-white font-[400]  font-poppins text-sm '>Airtime</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Phone number:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{number}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{amount}</p>
                    </div>
                    <button

                        onClick={handleSubmitButton}
                        className='bg-[#D45A0E] h-16 mt-5 w-full rounded-[35px] flex justify-center items-center '>
                        {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                            :
                            <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
                        }

                    </button>
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

export default BuyAirtime
