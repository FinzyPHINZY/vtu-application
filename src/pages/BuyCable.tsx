import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg'
import DSTV from '../assets/images/dstv.png'

const BuyCable = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageError, setPackageError] = useState('');
    const [number, setNumber] = useState('');
    const [numberError, setNumberError] = useState('');


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


    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumber(value);



    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPackage) {
            setPackageError('Please select an email address.');
        }
        if (!number || number.length !== 11) {
            setNumberError('Please enter a valid phone number with 11 digits.');
        }
        if (selectedPackage && number && number.length === 11) {
            setPackageError('');
            setNumberError('');
            navigate('/otp');
        }
    };

    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col justify-between'>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />
                            <p className='text-white font-[400] text-base font-poppins'>Buy Cable</p>
                            <div>       </div>
                        </div>
                        <p className='text-white mt-14 font-[400] text-sm font-poppins '>Select network</p>
                        <div className='flex justify-between items-center py-3 mt-5 '>
                            <img src={DSTV} className='w-15 h-15 rounded-xl' />
                            <img src={DSTV} className='w-15 h-15 rounded-xl' />
                            <img src={DSTV} className='w-15 h-15 rounded-xl' />
                            <img src={DSTV} className='w-15 h-15 rounded-xl' />
                        </div>
                        <form className='mt-20 flex-grow flex flex-col justify-between pb-20' onSubmit={handleSubmit}>
                            <div>
                                <div>
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Select Package</p>
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
                                    <p className='text-white font-[500] text-base font-poppins mb-5'>Smartcard number</p>
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
                                <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
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

export default BuyCable
