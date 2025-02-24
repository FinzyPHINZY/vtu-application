import { useState, useEffect, useRef } from "react";
import DesktopImage from "../../assets/images/bold-data.png";
// import { useNavigate } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { EditIcon, SecondSearchIcon } from "../../assets/svg";
import "../../App.css";
import { Circles } from "react-loader-spinner";
import { toast } from "react-toastify";

const ManageServices = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  //   const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageError, setPackageError] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  //   const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setChecked(event.target.checked);
  //   };
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [serviceNameError, setServiceNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [discountError, setDiscountError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState("Data");

  const handleClick = (status: string) => {
    setActive(status);
  };

  const buttonStyle = (status: string) => ({
    backgroundColor: active === status ? "#D45A0E" : "#1A1617",
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobileView(isMobile);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  const handleServiceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServiceName(value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
  };
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscount(value);
  };

  const packageOptions = ["2 days", "5 days", "7 days", "8 days"];

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPackage(e.target.value);
    setPackageError("");
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (discount && serviceName && price) {
      setPriceError("");
      setDiscountError("");
      setServiceNameError("");

      setLoading(true);
      // navigate('/login');
      try {
        setLoading(true);
      } catch (err) {
        console.error(err);
        toast.error("Password creation failed. Please try again.");
      } finally {
        setLoading(false);
        setPrice("");
        setDiscount("");
        setServiceName("");
      }
    } else {
      setPriceError("Please enter a valid price .");
      setDiscountError("Please enter a valid discount");
      setServiceNameError("Please provide the service.");
    }
  };
  return (
    <div>
      {isMobileView ? (
        // JSX for screens below 768px
        <div className="min-h-screen w-full bg-black pt-7 px-5 ">
          {showModal && (
            <div className="absolute inset-0 bg-black bg-opacity-75 blur-sm"></div>
          )}
          <div className="flex justify-between items-center mb-5">
            <p className="text-white font-[500]  font-poppins text-2xl ">
              Manage services
            </p>
            <SecondSearchIcon />
          </div>

          <div className="flex justify-between items-center gap-4">
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Data")}
              onClick={() => handleClick("Data")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Data
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Airtime")}
              onClick={() => handleClick("Airtime")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Airtime
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Cable TV")}
              onClick={() => handleClick("Cable TV")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Cable TV
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Utilities")}
              onClick={() => handleClick("Utilities")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Utilities
              </p>
            </div>
          </div>

          <div className="flex justify-start gap-4 items-center mt-5">
            <div className="bg-[#1A1617] w-full p-4  rounded-[8px]">
              <div className="flex justify-between items-center mt-2">
                <p className="text-white font-[400]  font-poppins text-sm ">
                  Service name:
                </p>
                <p className={` font-[400] font-poppins text-sm text-white `}>
                  Mtn data
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-white font-[400]  font-poppins text-sm ">
                  Price:
                </p>
                <p className={` font-[400] font-poppins text-sm text-white `}>
                  $20
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-white font-[400]  font-poppins text-sm ">
                  Validity:
                </p>
                <p className={` font-[400] font-poppins text-sm text-white `}>
                  7 days
                </p>
              </div>
              <div className="flex justify-between items-center mt-5 ">
                <div
                  className={`w-[33px] h-[20px]   ${
                    checked
                      ? "bg-[#34C759] justify-end"
                      : "bg-white justify-start"
                  } rounded-[50px] flex items-center`}
                >
                  <div
                    className={`h-[17px] w-[17px] rounded-[50px] ${
                      checked ? "bg-white" : "bg-[#34C759]"
                    }`}
                    onClick={() => setChecked(!checked)}
                  ></div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#D45A0E] h-10  w-[50%] rounded-[10px] flex justify-center items-center gap-4"
                >
                  <EditIcon />

                  <p className="text-[#FFFFFF] font-[600] text-base font-poppins">
                    Edit
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // JSX for screens above 768px
        <div className="min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between">
          {showModal && (
            <div className="absolute inset-0 bg-black bg-opacity-75 blur-sm"></div>
          )}
          <div className="text-white font-[500] font-kavoon text-2xl">
            Bold data
          </div>
          <div className="flex justify-center items-center ">
            <img src={DesktopImage} className="w-60 h-60 " />
          </div>

          <div className="">
            <p className="text-white font-[400]  font-poppins text-4xl mb-3 text-center">
              Desktop site is currently unavailable
            </p>
            <p className="text-white font-[400]  font-poppins text-2xl text-center">
              Please use mobile version or resize your browser
            </p>
          </div>

          <div>
            <p className="text-white font-[400]  font-poppins text-2xl text-center mb-2">
              Follow us on
            </p>
            <div className="flex flex-1 justify-center items-center gap-4">
              <a
                href="https://www.instagram.com/data.bold/#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="text-white" />
              </a>
              <a
                href="https://web.facebook.com/people/BOLD-DATA/61565221174295/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFacebook className="text-white" />
              </a>
              <a
                href="https://wa.me/2348036813099"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp className="text-white" />
              </a>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div
          ref={modalRef}
          className="fixed bottom-0 inset-x-0 bg-[#1A1617] h-[480px] py-5 px-10 z-50 flex justify-start flex-col"
        >
          <form
            className=" flex-grow flex flex-col justify-between pb-20"
            onSubmit={handleSubmit}
          >
            <div>
              <p className="text-[#E0E0E0] font-[500] text-base font-poppins  my-2">
                {" "}
                Service name(Non-editable)
              </p>
              <input
                type="text"
                value={serviceName}
                onChange={handleServiceNameChange}
                className="w-full h-10 border border-[#E0E0E0] rounded-[10px] px-4 text-white bg-[#1A1617] outline-none"
                placeholder="Mtn data"
              />
              {serviceNameError && (
                <p className="text-[#D45A0E] text-sm text-center">
                  {serviceNameError}
                </p>
              )}
            </div>
            <div>
              <p className="text-[#E0E0E0] mt-5 mb-2 font-[500] text-base font-poppins">
                {" "}
                Price
              </p>
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                className="w-full h-10 border border-[#E0E0E0] rounded-[10px] px-4 text-white bg-[#1A1617]  outline-none"
                placeholder="0- 200,00"
              />
              {priceError && (
                <p className="text-[#D45A0E] text-sm text-center">
                  {priceError}
                </p>
              )}
            </div>
            <div>
              <p className="text-[#E0E0E0] font-[500] text-base font-poppins mt-5 mb-2">
                Validity
              </p>
              <div className="relative">
                <select
                  value={selectedPackage}
                  onChange={handlePackageChange}
                  className="w-full h-10 border border-[#E0E0E0] bg-[#1A1617] rounded-[10px] pl-4 pr-10 text-[#FFFFFF6B]  outline-none appearance-none"
                >
                  <option value="" disabled className="">
                    Select Validity
                  </option>
                  {packageOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                  <svg
                    className="w-4 h-4 fill-current text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12l-6-6h12l-6 6z" />
                  </svg>
                </div>
              </div>

              {packageError && (
                <p className="text-[#D45A0E] text-sm text-center">
                  {packageError}
                </p>
              )}
            </div>
            <div>
              <p className="text-[#E0E0E0] font-[500] mt-5 mb-2 text-base font-poppins">
                {" "}
                Discount (Optional)
              </p>
              <input
                type="text"
                value={discount}
                onChange={handleDiscountChange}
                className="w-full h-10 border border-[#E0E0E0] rounded-[10px] px-4 text-white bg-[#1A1617] outline-none"
                placeholder="0- 200,00"
              />
              {discountError && (
                <p className="text-[#D45A0E] text-sm text-center">
                  {discountError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#D45A0E] h-12 mt-7 w-full rounded-[24px] flex justify-center items-center "
            >
              {loading ? (
                <Circles
                  height="30"
                  width="30"
                  color="#FFFFFF"
                  ariaLabel="loading"
                />
              ) : (
                <p className="text-[#FFFFFF] font-[600] text-base font-poppins">
                  Save
                </p>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
