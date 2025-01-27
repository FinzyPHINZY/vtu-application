import { useState, useEffect } from 'react'
import DesktopImage from '../assets/images/bold-data.png'
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { LeftArrowIcon } from '../assets/svg'
import { useInitiateVerificationMutation } from '../services/apiService';
import { Circles } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';


const CompleteSignup3 = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();
    const [bvn, setBvn] = useState('');
    const [bvnError, setBvnError] = useState('');
    const [initiateVerification] = useInitiateVerificationMutation();
    const [loading, setLoading] = useState(false);
    const storedToken = useSelector((state: RootState) => state.auth.token);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBvn(value);

        if (bvn) {
            setBvnError('');
        } else {
            setBvnError('Please enter a valid email address.');
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (bvn) {
            setBvnError('');
            try {

                setLoading(true);
                const response = await initiateVerification({
                    type: "BVN", 
                    async: false, 
                    number: bvn, 
                    debitAccountNumber: "0119017579", 
                    token: storedToken
                });

                if (response.data.success) {

                    toast.success(response.data.message);
                    navigate('/complete-signup3');

                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch (err) {

                console.error(err);
                toast.error('There was an error. Please try again.');
            } finally {
                setBvn("")
                setLoading(false);
            }
        } else {
           
            setBvnError('Please enter your BVN.');
        }
    };
    return (
        <div>
            {
                isMobileView ? (
                    // JSX for screens below 768px
                    <div className='min-h-screen w-full bg-black pt-7 px-16 max-sm:px-7 flex flex-col '>
                        <div className='flex justify-between items-center'>
                            <LeftArrowIcon onClick={handleBack} />

                            <div>       </div>
                        </div>
                        <div className='text-white font-[600] text-lg font-poppins mt-10'>Verify your account555</div>
                        <form className='mt-20' onSubmit={handleSubmit}>
                            <p className='text-white font-[500] text-base font-poppins mb-5'>BVN Number</p>
                            <input
                                type='text'
                                value={bvn}
                                onChange={handleInputChange}
                                className='w-full h-16 border border-[#E0E0E0] rounded-[35px] px-4 text-white bg-black outline-none'
                                placeholder='22222222'
                            />
                            {bvnError && <p className='text-[#D45A0E] text-sm text-center'>{bvnError}</p>}


                            <button
                                type="submit"
                                className='bg-[#D45A0E] h-16 mt-16 w-full rounded-[35px] flex justify-center items-center '>

                                {loading ? <Circles height="30" width="30" color="#FFFFFF" ariaLabel="loading" />
                                    :
                                    <p className='text-[#FFFFFF] font-[600] text-base font-poppins'>Continue</p>}

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

export default CompleteSignup3
