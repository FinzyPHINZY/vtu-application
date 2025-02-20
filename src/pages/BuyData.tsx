import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { CancelIcon, LeftArrowIcon } from '../assets/svg'
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import '../App.css'
import {
    useFetchNetworksQuery,
    useFetchDataPlansQuery,
    usePurchaseData2Mutation,
    useGetUserDetailsMutation,
} from '../services/apiService';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import SuccessIcon from '../assets/images/success.png'
import BackgroundImage from '../assets/images/background.png'
import MTN from '../assets/images/MTN.jpg'
import AIRTEL from '../assets/images/Airtel.jpeg'
import GLO from '../assets/images/GLO.jpg'
import MOBILE from '../assets/images/9MOBILE.jpg'
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/slices/userSlices';


const BuyData = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [number, setNumber] = useState(() => localStorage.getItem('number') || '')
    const [numberError, setNumberError] = useState('');

    const storedToken = useSelector((state: RootState) => state.auth.token);
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [selectedDataPlan, setSelectedDataPlan] = useState<DataPlans | null>(null);
    const [loading, setLoading] = useState(false);
    const { data: serviceDataId, secondData } = location.state || {};
    const [showModal, setShowModal] = useState(false);
    const [purchaseData2] = usePurchaseData2Mutation();
    const { data: fetchDataPlans } = useFetchDataPlansQuery({ token: storedToken });
    const { data: fetchNetworks } = useFetchNetworksQuery({ token: storedToken });
    const [getUserDetails] = useGetUserDetailsMutation();
    const storedPin = useSelector((state: RootState) => state.user.pin);
    const [paymentSuccessfulModal, setPaymentSuccessfulModal] = useState(false);

    useEffect(() => {
        console.log(serviceDataId, fetchDataPlans, fetchNetworks);
    }, [serviceDataId, fetchDataPlans, fetchNetworks,]);

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


    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;


        const cleanValue = value.startsWith('+')
            ? '+' + value.replace(/[+\D]/g, '')
            : value.replace(/\D/g, '');

        console.log('Original value:', value);
        console.log('Cleaned value:', cleanValue);


        const phoneNumberPattern = /^(\+234|234|0)[1-9]\d{9}$/;

        if (!phoneNumberPattern.test(cleanValue)) {
            console.log('Validation failed');
            setNumberError('Please enter a valid phone number in either format:\n+234XXXXXXXXXX\nor\n234XXXXXXXXXX');
        } else {
            console.log('Validation passed');
            setNumberError('');
        }

        setNumber(value);
    };


    const handleSubmitButton = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();


        try {

            setLoading(true);
            console.log(
                parseInt(localStorage.getItem('amount') || '0', 10),
                parseInt(localStorage.getItem('NetworkId') || '0', 10),
                parseInt(localStorage.getItem('DataId') || '0', 10),
                number
            )
            const response = await purchaseData2({
                amount: parseInt(localStorage.getItem('amount') || '0', 10),
                mobile_number: number,
                network: parseInt(localStorage.getItem('NetworkId') || '0', 10),
                plan: parseInt(localStorage.getItem('DataId') || '0', 10),
                Ported_number: true,
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

            setNumber("");
            localStorage.setItem('amount', '');
            localStorage.setItem('number', '');
            localStorage.setItem('DataId', '');
            localStorage.setItem('NetworkId', '');
            setLoading(false);
            setShowModal(false);
        }

    };


    useEffect(() => {
        if (secondData) {
            setShowModal(true);
        }
    }, [secondData]);

    useEffect(() => {


        if (selectedDataPlan) {
            localStorage.setItem('amount', selectedDataPlan.amount.toString());
            localStorage.setItem('DataId', selectedDataPlan.data_id.toString());
        }
        if (selectedNetwork) {
            localStorage.setItem('NetworkId', selectedNetwork.network_id.toString());
        }
        localStorage.setItem('number', number);
    }, [selectedDataPlan, number, selectedNetwork, selectedDataPlan?.data_id, selectedNetwork?.network_id]);

    const handleCloseModal = async () => {

        if (!number) {
            setNumberError('Please enter a valid phone number.');
            return
        }

        if (!selectedNetwork) {
            toast.error('Please click and select any network');
            return
        }

        if (!selectedDataPlan) {
            toast.error('Please select a data plan');
            return
        }
        setLoading(true);
        if (selectedDataPlan?.amount && number) {

            setNumberError('');
            navigate('/pin/data/enter', { state: { service: "data" } });

            setLoading(false);
        } else {
            setNumberError('Please enter a valid phone number');


        }
    };


    interface Network {
        _id: string;
        network_id: number;
        networkname: string;
        __v: number;
        createdAt: string;
        updatedAt: string;
    }

    interface DataPlans {
        _id: string;
        data_id: number;
        network: string;
        planType: string;
        amount: number;
        size: string;
        validity: string;
        __v: number;
    }

    const handleItemClick = (network: Network) => {
        setSelectedNetwork(network);
    };

    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        {(showModal || paymentSuccessfulModal) && <div className='absolute inset-0 bg-black bg-opacity-75 blur-sm'></div>}
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Data</p>
                            <div>       </div>
                        </div>
                        <p className='text-white font-[400] text-base font-poppins mt-10'>Select any network</p>
                        <div className='flex justify-between items-center py-3 mt-2 '>
                            {fetchNetworks && fetchNetworks.data.map((network: Network, index: number) => {

                                return (
                                    <div className=' flex flex-col justify-center items-center gap-2'
                                        key={index}
                                        onClick={() => handleItemClick(network)}
                                    >
                                        {network.networkname === 'MTN' &&
                                            <div className={`card ${selectedNetwork === network ? ' bg-[#333333] opacity-50' : ''}`}>
                                                <img src={MTN} alt={network.networkname} />
                                            </div>
                                        }
                                        {network.networkname === 'GLO' &&
                                            <div className={`card ${selectedNetwork === network ? 'bg-[#333333] opacity-50' : ''}`}>
                                                <img src={GLO} alt={network.networkname} />
                                            </div>
                                        }
                                        {network.networkname === 'AIRTEL' &&
                                            <div className={`card ${selectedNetwork === network ? 'bg-[#333333] opacity-50' : ''}`}>
                                                <img src={AIRTEL} alt={network.networkname} />
                                            </div>
                                        }
                                        {network.networkname === '9MOBILE' &&
                                            <div className={`card ${selectedNetwork === network ? 'bg-[#333333] opacity-50' : ''}`}>
                                                <img src={MOBILE} alt={network.networkname} />
                                            </div>
                                        }

                                    </div>
                                )
                            })}



                        </div>

                        <form className='mt-10 flex-grow flex flex-col justify-between pb-20'>
                            <div>

                                <div className=''>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Phone number</p>
                                    <input
                                        type="number"
                                        value={number}
                                        onChange={handleNumberChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='08178909913'
                                    />
                                    {numberError && <p className='text-[#D45A0E] text-sm text-center'>{numberError}</p>}

                                </div>

                                <div className=' gap-4  mt-10'>
                                    {/* {fetchDataPlans && selectedNetwork && fetchDataPlans.data
                                        .filter((dataPlan: DataPlans) => dataPlan.network === selectedNetwork.networkname)
                                        .map((dataPlan: DataPlans, index: number) => {
                                            const isSelected = selectedDataPlan && selectedDataPlan.data_id === dataPlan.data_id;
                                            return (
                                                <div
                                                    className={`flex flex-col rounded-xl border h-24 w-[30%] justify-center items-center gap-2 cursor-pointer ${isSelected ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                                                    key={index}
                                                    onClick={() => setSelectedDataPlan(dataPlan)}>
                                                    <div className=" p-2 ">
                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>N{dataPlan.amount}</p>
                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.size}</p>
                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.validity}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                            */}

                                    {/* {fetchDataPlans && selectedNetwork && (
                                        Object.entries(
                                            fetchDataPlans.data
                                                .filter((dataPlan: DataPlans) => dataPlan.network === selectedNetwork.networkname)
                                                .reduce((acc: Record<string, DataPlans[]>, dataPlan: DataPlans) => {
                                                    const planType = dataPlan.planType;
                                                    if (!acc[planType]) {
                                                        acc[planType] = [];
                                                    }
                                                    acc[planType].push(dataPlan);
                                                    return acc;
                                                }, {} as Record<string, DataPlans[]>)
                                        ).map(([planType, plans]) => (
                                            <div key={planType} className=" mt-10 gap-4">
                                                <h3 className="text-white font-[600] text-base font-poppins mb-2">
                                                    {planType}
                                                </h3>
                                                <div className='flex justify-between flex-wrap items-center gap-4  mt-2'>
                                                    {(plans as DataPlans[]).map((dataPlan: DataPlans, index: number) => {
                                                        const isSelected = selectedDataPlan && selectedDataPlan.data_id === dataPlan.data_id;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`flex flex-col rounded-xl border h-28 w-[30%] justify-center items-center gap-2 cursor-pointer ${isSelected ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                                                                onClick={() => setSelectedDataPlan(dataPlan)}
                                                            >
                                                                <div className="p-2">
                                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>N{dataPlan.amount}</p>
                                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.size}</p>
                                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.validity}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )} */}
                                    {fetchDataPlans && selectedNetwork && (
                                        Object.entries(
                                            fetchDataPlans.data
                                                .filter((dataPlan: DataPlans) => dataPlan.network === selectedNetwork.networkname)
                                                .reduce((acc: Record<string, DataPlans[]>, dataPlan: DataPlans) => {
                                                    const planType = dataPlan.planType;
                                                    if (!acc[planType]) {
                                                        acc[planType] = [];
                                                    }
                                                    acc[planType].push(dataPlan);
                                                    return acc;
                                                }, {} as Record<string, DataPlans[]>)
                                        ).map(([planType, plans]) => (
                                            (planType !== 'CORPORATE GIFTING' && planType !== 'GIFTING' && planType !== 'DATA COUPONS') && (
                                                <div key={planType} className=" mt-10 gap-4">
                                                    <h3 className="text-white font-[600] text-base font-poppins mb-2">
                                                        {planType}
                                                    </h3>
                                                    <div className='flex justify-between flex-wrap items-center gap-4 mt-2'>
                                                        {(plans as DataPlans[]).map((dataPlan: DataPlans, index: number) => {
                                                            const isSelected = selectedDataPlan && selectedDataPlan.data_id === dataPlan.data_id;
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className={`flex flex-col rounded-xl border h-28 w-[30%] justify-center items-center gap-2 cursor-pointer ${isSelected ? 'border-[#FFFFFF] bg-[#333333]' : 'border-black bg-[#595959]'}`}
                                                                    onClick={() => setSelectedDataPlan(dataPlan)}
                                                                >
                                                                    <div className="p-2">
                                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>N{dataPlan.amount}</p>
                                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.size}</p>
                                                                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>{dataPlan.validity}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    )}


                                </div>

                                {/* <div className='flex justify-between flex-wrap items-center py-3 mt-10 '>
                                    {fetchDataPlans && fetchDataPlans.data.map((dataPlan: DataPlans, index: number) => {

                                        return (
                                            <div className=' flex flex-col justify-center items-center gap-2'
                                                key={index}
                                            >
                                                <div className="h-6 w-6 rounded-md shadow-md ">
                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'> {dataPlan.amount}</p>
                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'> {dataPlan.size}</p>
                                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'> {dataPlan.validity}</p>
                                                </div>
                                            </div>
                                        )
                                    })}



                                </div> */}
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
                                <a href="https://wa.me/2348036813099" target="_blank" rel="noopener noreferrer">
                                    <FaWhatsapp className='text-white' />
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
                        <p className='text-white font-[400]  font-poppins text-sm '>DATA</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Phone number:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{number}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                        <p className='text-white font-[400]  font-poppins text-sm '>Amount:</p>
                        <p className='text-white font-[400]  font-poppins text-sm '>{localStorage.getItem('amount')}</p>
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

export default BuyData
