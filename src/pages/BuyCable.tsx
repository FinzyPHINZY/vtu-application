import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { LeftArrowIcon } from '../assets/svg'
import {
    useFetchCableListQuery,
    useFetchCablePlansQuery,
    usePurchaseCableTV2Mutation,
    useGetUserDetailsQuery,
} from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { CancelIcon } from '../assets/svg'
import SuccessIcon from '../assets/images/success.png'
import BackgroundImage from '../assets/images/background.png'
import STARTIMES from '../assets/images/STARTIMES.jpeg'
import GOTV from '../assets/images/GOTV.png'
import DSTV from '../assets/images/DSTV1.png'
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';


const BuyCable = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageError, setPackageError] = useState('');
    const [selectedCableList, setSelectedCableList] = useState<CableList | null>(null);
    const [selectedCablePlan, setSelectedCablePlan] = useState<CablePlan | null>(null);
    const [amount, setAmount] = useState(() => localStorage.getItem('amount') || '')
    const [number, setNumber] = useState(() => localStorage.getItem('number') || '')
    const [numberError, setNumberError] = useState('');
    // const [amountError, setAmountError] = useState('');
    // const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [loading, setLoading] = useState(false);
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const [purchaseCableTV2] = usePurchaseCableTV2Mutation();
    const { data: serviceDataId, secondData } = location.state || {};
    const [showModal, setShowModal] = useState(false);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);
    const { data: cablePlans } = useFetchCablePlansQuery({ token: storedToken });
    const { data: cableList } = useFetchCableListQuery({ token: storedToken });
    const { data: userDetails } = useGetUserDetailsQuery({ token: storedToken });
    // const [verifyPowerTVData] = useVerifyPowerTVDataMutation();
    useEffect(() => {
        console.log(serviceDataId, cableList, cablePlans);
    }, [serviceDataId, cableList, cablePlans]);

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
 

    // const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setAmount(e.target.value);
    //     setAmountError('');
    // };
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);
        // handleMeterNumberVerification();



    };

    const handleSubmitButton = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();


        try {

            setLoading(true);
            const response = await purchaseCableTV2({
                cablename: parseInt(localStorage.getItem('cableName') || '0', 10),
                cableplan: parseInt(localStorage.getItem('cablePlan') || '0', 10),
                amount: parseInt(localStorage.getItem('amount') || '0', 10),
                smart_card_number: number,
                transactionPin: storedPin,
                token: storedToken
            });

            if (response?.data?.success) {
                toast.success(response.data.message);
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
            setNumber("");
            setAmount("");
            setSelectedPackage("");
            localStorage.setItem('amount', '');
            localStorage.setItem('number', '');
            localStorage.setItem('cablePlan', '');
            localStorage.setItem('cableName', '');
            setLoading(false);
            setShowModal(false)
        }


    };


    useEffect(() => {
        if (secondData) {
            setShowModal(true);
        }
    }, [secondData]);

    useEffect(() => {
      
        console.log('number:', number);
    
        localStorage.setItem('number', number);
        console.log('selectedCableList:', selectedCableList);
        console.log('selectedCablePlan:', selectedCablePlan);
   
        if (selectedCableList) {
         
            localStorage.setItem('cableName', selectedCableList?.cable_id?.toString());
        }

        if (selectedCablePlan) {
            localStorage.setItem('amount', selectedCablePlan?.amount?.toString());
            localStorage.setItem('cablePlan', selectedCablePlan?.cablePlanID?.toString());
        } 
       
    }, [amount, number, selectedCableList?.cable_id, selectedCablePlan?.cablePlanID, selectedCableList, selectedCablePlan]);


    const handleCloseModal = async () => {
        if (!selectedPackage) {
            setPackageError('Please select a cable plan.');
            return;
        }
        if (!number) {
            setNumberError('Please enter a valid card number.');
            return;
        }
     
        if (!selectedCableList) {
            toast.error('Please your choice from the list of cables');
            return;
        }
        if (!selectedCablePlan) {
            toast.error('Please your cable plan');
            return;
        }
        setLoading(true);
        if (selectedCablePlan && number && selectedCableList) {
            setPackageError('');
            setNumberError('');
        
            navigate('/pin/cable/enter', { state: { service: "cabletv" } });

            setLoading(false);
        } else {
            setNumberError('Please enter a valid card number');
            setPackageError('Please select a cable plan.');
           
        }
    };


    interface CableList {
        _id: string;
        cable_id: number;
        cablename: string;
        __v: number;
        createdAt: string;
        updatedAt: string;
    }

    interface CablePlan {
        _id: string;
        cablePlanID: number;
        cablename: string;
        amount: number;
        __v: number;
        createdAt: string;
        updatedAt: string;
    }

    const getFilteredCablePlans = (cablePlans: CablePlan[], selectedCableList: CableList | null) => {
        if (!selectedCableList) return [];
        return cablePlans.filter((plan: CablePlan) => plan.cablename.includes(selectedCableList.cablename));
    };
    
    const getStartimesPlans = (cablePlans: CablePlan[], selectedCableList: CableList | null) => {
        if (!selectedCableList) return [];
        return cablePlans.filter((plan: CablePlan) => !plan.cablename.includes(selectedCableList.cablename));
    };
    
    // const packageOptions = getStartimesPlans(cablePlans.data, selectedCableList).map((plan: CablePlan) => plan.cablename) || getFilteredCablePlans(cablePlans.data, selectedCableList).map((plan: CablePlan) => plan.cablename);

    const packageOptions = cablePlans && cablePlans.data 
    ? (getStartimesPlans(cablePlans.data, selectedCableList).map((plan: CablePlan) => plan.cablename) || getFilteredCablePlans(cablePlans.data, selectedCableList).map((plan: CablePlan) => plan.cablename))
    : [];


    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPackageName = e.target.value;
        setSelectedPackage(selectedPackageName);
        
        // Find the selected cable plan object
        const selectedPlan = cablePlans.data.find((plan: CablePlan) => plan.cablename === selectedPackageName);
        
        // Set the selected cable plan
        setSelectedCablePlan(selectedPlan || null);
        setPackageError('');
    };
    

    // const handleItemClick = (servicedata: ServiceData) => {
    //     setSelectedService(servicedata);
    // };

    // const handleMeterNumberVerification = async () => {
    //     try {
    //         const response = await verifyPowerTVData({
    //             token: storedToken,
    //             serviceCategoryId: "61e9857bbce8e444a4976641",
    //             entityNumber: number
    //         })
    //         if (response.data.success) {
    //             setVerified(response.data.message)
    //         } else {
    //             toast.error("Your meter number is not valid")

    //             // setSelectedPackage("")
    //         }


    //     } catch {
    //         toast.error("There was an error please try again");


    //     }
    // }
    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        {(showModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Cable</p>
                            <div>       </div>
                        </div>
                        <p className='text-white mt-14 font-[400] text-sm font-poppins '>Select Provider</p>
                        <div className='flex justify-between items-center py-3 mt-10 '>
                            {cableList && cableList.data.map((inCableList: CableList, index: number) => {

                                return (
                                    <div className=' flex flex-col justify-center items-center gap-2'
                                        key={index}
                                        onClick={() => setSelectedCableList(inCableList)}
                                    >
                                        {inCableList.cablename === 'GOTV' &&
                                            <div className={`card ${selectedCableList === inCableList ? 'border-4 border-[white] bg-[#333333]' : ''}`}>
                                                <img src={GOTV} alt={inCableList.cablename} />
                                            </div>
                                        }
                                        {inCableList.cablename === 'DSTV' &&
                                            <div className={`card ${selectedCableList === inCableList ? 'border-4 border-[white] bg-[#333333]' : ''}`}>
                                                <img src={DSTV} alt={inCableList.cablename} />
                                            </div>
                                        }
                                        {inCableList.cablename === 'STARTIMES' &&
                                            <div className={`card ${selectedCableList === inCableList ? 'border-4 border-[white] bg-[#333333]' : ''}`}>
                                                <img src={STARTIMES} alt={inCableList.cablename} />
                                            </div>
                                        }


                                    </div>
                                )
                            })}



                        </div>

                        <form className='mt-10 flex-grow flex flex-col justify-between pb-20' >
                            <div>


                                <div className=''>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Card number</p>
                                    <input
                                        type="number"
                                        value={number}
                                        onChange={handleNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='1234567890'
                                    />
                                    {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                </div>

                                <div className='mt-5'>
                                    {/* <p className='text-white font-[500] text-base font-poppins mb-5'>Amount</p>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='200'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}
                                     */}
                                    <div className='mt-5'>
                                        <p className='text-white font-[500] text-base font-poppins mb-5'>Select Cable Plan</p>
                                        <div className="relative">
                                            <select
                                                value={selectedPackage}
                                                onChange={handlePackageChange}
                                                className='w-full h-16 border border-[#E0E0E0] rounded-[35px] pl-4 pr-10 text-white bg-black outline-none appearance-none'
                                            >
                                                <option value="" disabled>Select Cable plan</option>
                                                {packageOptions.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
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
                        <p className='text-white font-[400]  font-poppins text-sm '>CABLETV</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Card number:</p>
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

export default BuyCable
