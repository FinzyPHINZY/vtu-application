import { useState, useEffect } from 'react';
import DesktopImage from '../assets/images/bold-data.png';
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg';

const CreateTransactionPin = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [pin, setPin] = useState(['', '', '', '']);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            setIsMobileView(isMobile);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleKeypadClick = (key: string) => {
        const newPin = [...pin];
        if (key === '×') {
            for (let i = 3; i >= 0; i--) {
                if (newPin[i] !== '') {
                    newPin[i] = '';
                    break;
                }
            }
        } else if (newPin.filter(num => num !== '').length < 4) {
            for (let i = 0; i < 4; i++) {
                if (newPin[i] === '') {
                    newPin[i] = key;
                    break;
                }
            }
        }
        setPin(newPin);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleCloseModal = () => {
        setPin(['', '', '', '']);
        navigate('/otp');
    };

    return (
        <div>
            {isMobileView ? (
                <div className='min-h-screen w-full bg-black pt-7 pb-10 px-16 max-sm:px-7 flex flex-col justify-between'>
                    <div className='flex justify-between items-center'>
                        <LeftArrowIcon onClick={handleBack} />
                        <p className='text-white font-[400] text-base font-poppins'>Set transaction pin</p>
                        <div></div>
                    </div>
                    <p className='font-poppins font-[400] text-center text-sm text-white my-8'>
                        Set a 4-digit transaction pin, as it will be required for transaction
                    </p>
                    <div className='flex justify-between items-center '>
                        {pin.map((digit, index) => (
                            <div key={index} className='w-full h-16 text-white bg-black outline-none text-center'>
                                {digit ? '*' : ''}
                            </div>
                        ))}
                    </div>
                    <div className='grid grid-cols-3 gap-3 my-5'>
                        {[...'123456789.0×'].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeypadClick(key)}
                                className='h-16 text-white rounded text-base'
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className='bg-[#D45A0E] h-16 w-full rounded-[35px] flex justify-center items-center'>
                        <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>
                    </button>
                </div>
            ) : (
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
    );
};

export default CreateTransactionPin;
