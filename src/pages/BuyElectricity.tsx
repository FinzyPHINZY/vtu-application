import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import {
    useFetchPowerProvidersQuery,
    usePurchaseUtilityBill2Mutation,
    useGetUserDetailsMutation,
} from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import '../App.css'
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { CancelIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import BackgroundImage from '../assets/images/background.png'
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';

const BuyElectricity = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageError, setPackageError] = useState('');
    const [selectedPowerProvider, setSelectedPowerProvider] = useState<PowerProvider | null>(null);
    const [amount, setAmount] = useState(() => localStorage.getItem('amount') || '')
    const [number, setNumber] = useState(() => localStorage.getItem('number') || '')
    const [meterType, setMeterType] = useState<string>(() => localStorage.getItem('meterType') || '');
    const [meterTypeError, setMeterTypeError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [loading, setLoading] = useState(false);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const [purchaseUtilityBill2] = usePurchaseUtilityBill2Mutation();
    const { data: serviceDataId, secondData } = location.state || {};
    const [showModal, setShowModal] = useState(false);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const { data: powerProviders } = useFetchPowerProvidersQuery({ token: storedToken });
    const [getUserDetails] = useGetUserDetailsMutation();


    useEffect(() => {
        console.log(serviceDataId, powerProviders);
    }, [serviceDataId, powerProviders]);

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
    const packageOptions: PackageOption[] = powerProviders?.data.map((provider: PowerProvider) => ({
        label: provider.name,
        value: provider.disco_id
    })) || [];
    console.log(meterType, 44)
    const handleMeterTypeChange = (type: string) => {
        setMeterType(type);
    };

    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = parseInt(e.target.value);
        setSelectedPackage(e.target.value);
        setPackageError('');

        // Find the selected power provider object
        const selectedProvider = powerProviders?.data.find((provider: PowerProvider) => provider.disco_id === selectedValue);

        // Set the selected power provider
        setSelectedPowerProvider(selectedProvider || null);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        setAmountError('');
    };
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);
        // handleMeterNumberVerification();

    };


    // const handleItemClick = (servicedata: ServiceData) => {
    //     setSelectedService(servicedata);
    // };


    const handleSubmitButton = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            console.log(localStorage.getItem('DiscoName'))
            setLoading(true);
            const response = await purchaseUtilityBill2({
                disco_name: parseInt(localStorage.getItem('DiscoName') || '0', 10),
                meterType: "prepaid",
                meter_number: number,
                amount: parseInt(amount, 10),
                transactionPin: storedPin,
                token: storedToken

            });

            if (response?.data?.success) {
                toast.success(response.data.message);
                const userDetails = await getUserDetails({ token: storedToken })
                dispatch(setUserInfo(userDetails.data));
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
            // setSelectedPackage("");
            localStorage.setItem('DiscoName', '');
            localStorage.setItem('amount', '');
            localStorage.setItem('number', '');
            localStorage.setItem('meterType', '');
            setLoading(false);
            setShowModal(false)
        }



    }

    useEffect(() => {
        if (secondData) {
            setShowModal(true);
        }
    }, [secondData]);

    useEffect(() => {
        // Store amount and number in localStorage
       
        localStorage.setItem('DiscoName', selectedPowerProvider?.disco_id?.toString() || '');
        localStorage.setItem('amount', amount);
        localStorage.setItem('number', number);
        localStorage.setItem('meterType', meterType);
    }, [amount, number, selectedPowerProvider?.disco_id, meterType]);


    const handleCloseModal = async () => {
        if (!selectedPackage) {
            setPackageError('Please select a provider.');
            return;
        }
        if (!number) {
            setNumberError('Please enter a valid meter number');
            return;
        }
        if (!amount) {
            setAmountError('Please enter the amount of units');
            return;
        }
        if (!meterType) {
            setMeterTypeError('Please select a meter type');
            return;
        }

        setLoading(true);
        if (number && amount && selectedPackage && meterType) {
            setPackageError('');
            setNumberError('');
            setAmountError("");
            setMeterTypeError("")
            navigate('/pin/utility/enter', { state: { service: "utility" } });

            setLoading(false);
        } else {
            setAmountError('Please enter a valid amount.');
            setNumberError('Please enter a valid meter number');
            setPackageError('Please select a provider');
            setMeterTypeError('Please select a meter type');
        }
    };

    interface PowerProvider {
        _id: string;
        disco_id: number;
        name: string;
        __v: number;
        createdAt: string;
        updatedAt: string;
    }

    interface PackageOption {
        label: string;
        value: number;
    }

    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        {(showModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Electricity</p>
                            <div>       </div>
                        </div>

                        {/* <div className='flex justify-between items-center py-3 mt-10 overflow-x-auto '> */}

                        <div className='flex justify-between items-center py-3 border-b-[1px] border-[#FFFFFF21] mt-10'>
                            <div
                                className={`h-14 w-[42%] rounded-[10px] flex justify-center items-center cursor-pointer ${meterType === 'prepaid' ? 'bg-[#2F2F2F] border-2 border-[#FFFFFF]' : 'bg-[#D45A0E]'}`}
                                onClick={() => handleMeterTypeChange('prepaid')}
                            >
                                <p className='text-white font-poppins font-[400] text-base'>Prepaid</p>
                            </div>
                            <div
                                className={`h-14 w-[42%] rounded-[10px] flex justify-center items-center cursor-pointer ${meterType === 'postpaid' ? 'bg-[#2F2F2F] border-2 border-[#FFFFFF]' : 'bg-[#D45A0E]'}`}
                                onClick={() => handleMeterTypeChange('postpaid')}
                            >
                                <p className='text-white font-poppins font-[400] text-base'>Postpaid</p>
                            </div>
                        </div>

                        {meterTypeError && <p className='text-[#D45A0E] text-sm text-center'>{meterTypeError}</p>}

                        <form className='mt-10 flex-grow flex flex-col justify-between pb-20'>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Select Provider</p>
                                    <div className="relative">
                                        <select
                                            value={selectedPackage}
                                            onChange={handlePackageChange}
                                            className='w-full h-16 border border-[#E0E0E0] rounded-[35px] pl-4 pr-10 text-white bg-black outline-none appearance-none'
                                        >
                                            <option value="" disabled>Select provider</option>
                                            {packageOptions.map((option: PackageOption, index: number) => (
                                                <option key={index} value={option.value.toString()}>{option.label}</option>
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
                                <div className='mt-5'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Meter number</p>
                                    <input
                                        type="number"
                                        value={number}
                                        onChange={handleNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='1234567890'
                                    />
                                    {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                </div>
                                {/* {verified && <p className='text-[#4CAF50] font-[400] text-sm font-poppins mt-3'>{verified}</p>} */}
                                <div className='mt-5'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Amount</p>

                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='200'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}

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
                        {(showModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
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
                        <p className='text-white font-[400]  font-poppins text-sm '>Utility</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Meter number:</p>
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

export default BuyElectricity
