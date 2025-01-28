import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg'
import { useFetchServiceByIdQuery, useFetchServiceCategoriesQuery } from '../services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import '../App.css'
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { usePayUtilityBillMutation } from '../services/apiService';

const BuyElectricity = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageError, setPackageError] = useState('');
    const [number, setNumber] = useState('');
    const [numberError, setNumberError] = useState('');
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [loading, setLoading] = useState(false);
    const storedToken = useSelector((state: RootState) => state.auth.token);
    const [payUtlityBill] = usePayUtilityBillMutation();
    const { data: serviceDataId } = location.state || {};


    const { data: servicesByIdData } = useFetchServiceByIdQuery({ token: storedToken, id: serviceDataId });
    const { data: servicesByCategoryData } = useFetchServiceCategoriesQuery({ token: storedToken, id: serviceDataId });

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
        navigate(-1);
    };
    const packageOptions = ['example@gmail.com', 'example@yahoo.com', 'example@outlook.com'];

    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPackage(e.target.value);
        setPackageError('');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        setAmountError('');
    };
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);



    };

    interface ServiceData {
        logoUrl: string;
        name: string;
        identifier: string;
    }

    const handleItemClick = (servicedata: ServiceData) => {
        setSelectedService(servicedata);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPackage) {
            setPackageError('Please select a package.');
        }
        if (!number) {
            setNumberError('Please enter a valid meter number');
        }
        if (!amount) {
            setNumberError('Please enter the amount of units');
        }
        if (selectedPackage && number && amount) {
            setPackageError('');
            setNumberError('');
            setAmountError("")
         
            try {

                setLoading(true);
                const response = await payUtlityBill({
                    serviceCategoryId: "61e985180e69308aa37a7a94",
                    amount: 200,
                    channel: "string",
                    debitAccountNumber: "string",
                    phoneNumber: "string",
                    statusUrl: "string",
                    token: storedToken
                });

                if (response.data.success) {

                    toast.success(response.data.message);
                    navigate('/pin/enter', { state: { data: response.data.data, service: "utility" } });

                } else {

                    toast.error('Something Went Wrong. Please try again.');
                }
            } catch (err) {

                console.error(err);
                toast.error('Transaction failed. Please try again.');
            } finally {
                setAmount("");
                setNumber("");
                setSelectedPackage("");
                setLoading(false);
            }

        }
        else {
            setAmountError('Please enter a valid amount.');
            setNumberError('Please enter a valid phone number');
            setPackageError('Please select your choice');
        }
    }



    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Electricity</p>
                            <div>       </div>
                        </div>
                        <p className='text-white mt-14 font-[400] text-sm font-poppins '>Select Service</p>
                        {/* <div className='flex justify-between items-center py-3 mt-10 overflow-x-auto '> */}
                        <div className='flex flex-col items-center justify-between gap-4 relative pt-5'>
                            <div className='w-full p-4 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide ' >
                                {servicesByCategoryData && servicesByCategoryData.data.map((servicedata, index: number) => {
                                    console.log(servicedata.logoUrl, 40004);
                                    return (
                                        <div id="sliderItem"
                                            onClick={() => handleItemClick(servicedata)}
                                            key={index}
                                            className=' relative overflow-hidden shadow-md rounded-md hover:cursor-pointer inline-block hover:scale-105 ease-in-out duration-300 '>
                                            <div className="  h-fit rounded-[15px]  p-4 max-sm:p-2 " >
                                                {/* // <div className=' flex flex-col justify-center items-center gap-2'
                                                    key={index}> */}
                                                {servicedata.identifier === 'BENIN' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'EKO' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'ABUJA' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'ENUGU' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'IBADAN' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'IKEJA' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.identifier === 'JOS' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                                {servicedata.name === 'KADUNA' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }

                                                {servicedata.identifier === 'KANO' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }

                                                {servicedata.identifier === 'PORTHARCOURT' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }

                                                {servicedata.name === 'YOLA' &&
                                                    <div className="card">
                                                        <img src={servicedata.logoUrl} alt={servicedata.name} />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* </div> */}
                            </div>
                        </div>

                        <div className='flex justify-between items-center py-3 border-b-[1px] border-[#FFFFFF21] mt-2 '>
                            <div className='bg-[#2F2F2F] h-14 w-[42%] rounded-[10px] flex justify-center items-center'>
                                <p className='text-white font-poppins font-[400] text-base'>Prepaid</p>
                            </div>
                            <div className='bg-[#2F2F2F] h-14 w-[42%] rounded-[10px] flex justify-center items-center'>
                                <p className='text-white font-poppins font-[400] text-base'>Postpaid</p>
                            </div>
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
                        <form className='mt-10 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Select Provider</p>
                                    <div className="relative">
                                        <select
                                            value={selectedPackage}
                                            onChange={handlePackageChange}
                                            className='w-full h-16 border border-[#E0E0E0] rounded-[35px] pl-4 pr-10 text-white bg-black outline-none appearance-none'
                                        >
                                            <option value="" disabled>Select email</option>
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
                                <div className='mt-5'>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Amount</p>

                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                        placeholder='eg: $200'
                                    />
                                    {amountError && <p className='text-[#D45A0E] text-sm text-center'>{amountError}</p>}

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
                            </div>
                            <button
                                type="submit"
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
                                <FaInstagram className='text-white' />
                                <FiFacebook className='text-white' />
                                <RiTwitterXLine className='text-white' />

                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}

export default BuyElectricity
