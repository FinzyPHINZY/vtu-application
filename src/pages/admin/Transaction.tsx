import React, { useState, useEffect } from "react";
import DesktopImage from "../../assets/images/bold-data.png";
// import { useNavigate } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowDownIcon, CancelIcon, SecondSearchIcon } from "../../assets/svg";

type TransactionType = {
  name: string;
  account: string;
  amount: string;
  description: string;
  status: string;
  transactionId: string;
  date: string;
};

const Transaction = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  //   const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState("All");

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
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

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: `${year}`, label: `${year}` };
  });

  const months = React.useMemo(
    () => [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ],
    []
  );

  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear().toString();
    return years.find((y) => y.value === currentYear)?.label || "";
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = (new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0");
    return months.find((m) => m.value === currentMonth)?.label || "";
  });

  const days = React.useMemo(() => {
    const getDaysInMonth = (month: string, year: string) => {
      return new Date(parseInt(year), parseInt(month), 0).getDate();
    };

    const selectedMonthValue =
      months.find((m) => m.label === selectedMonth)?.value || "01";
    const selectedYearValue =
      years.find((y) => y.label === selectedYear)?.value ||
      new Date().getFullYear().toString();

    const daysInMonth = getDaysInMonth(selectedMonthValue, selectedYearValue);

    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: `${i + 1}`.padStart(2, "0"),
      label: `${i + 1}`,
    }));
  }, [selectedMonth, selectedYear, months, years]);

  const [selectedDay, setSelectedDay] = useState(() => {
    const currentDay = new Date().getDate().toString().padStart(2, "0");
    return days.find((d) => d.value === currentDay)?.label || "";
  });

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
              Transactions
            </p>
            <SecondSearchIcon />
          </div>

          <div className="flex justify-between items-center gap-4">
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("All")}
              onClick={() => handleClick("All")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                All
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Successful")}
              onClick={() => handleClick("Successful")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Successful
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Pending")}
              onClick={() => handleClick("Pending")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Pending
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[15px] flex justify-center items-center"
              style={buttonStyle("Failed")}
              onClick={() => handleClick("Failed")}
            >
              <p className="font-[300] font-[Poppins] text-[10px] text-[#FFFFFF] whitespace-normal">
                Failed
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center justify-end mb-5 mt-10">
            <div className="relative">
              <select
                value={years.find((y) => y.label === selectedYear)?.value || ""}
                onChange={(e) =>
                  setSelectedYear(
                    years.find((y) => y.value === e.target.value)?.label || ""
                  )
                }
                className="py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none"
              >
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
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
            <div className="relative">
              <select
                value={
                  months.find((m) => m.label === selectedMonth)?.value || ""
                }
                onChange={(e) =>
                  setSelectedMonth(
                    months.find((m) => m.value === e.target.value)?.label || ""
                  )
                }
                className="py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
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
            <div className="relative">
              <select
                value={days.find((d) => d.label === selectedDay)?.value || ""}
                onChange={(e) =>
                  setSelectedDay(
                    days.find((d) => d.value === e.target.value)?.label || ""
                  )
                }
                className="py-2 px-4 rounded-[35px] pl-4 pr-10 text-white bg-[#1E1E1E] outline-none appearance-none"
              >
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
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
          </div>

          <div className="flex justify-start gap-4 items-center">
            <div
              className="bg-[#1A1617] w-full p-4 flex justify-between rounded-[8px] items-center"
              onClick={() => {
                setShowModal(true);
                setSelectedTransaction({
                  name: "Nickson jay",
                  account: "234903681436",
                  amount: "$200",
                  description: "Mtn 2gb Sme....",
                  status: "Failed",
                  transactionId: "HFHSHFDSUYFY",
                  date: new Date().toISOString(),
                });
              }}
            >
              <div className="">
                <div className="flex justify-start gap-2 items-center">
                  <ArrowDownIcon />
                  <div>
                    <p className="text-white font-[400] font-poppins text-[14px]">
                      Nickson jay
                    </p>
                    <p className="text-[#FFFFFF6B] font-[400] font-poppins text-[12px] mt-2">
                      234903681436
                    </p>
                  </div>
                </div>
                <p className="text-[#FFFFFF6B] font-[400] font-poppins text-[11px] mt-3">
                  20 JAN, 2025 - 12:30PM
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-white font-[400] font-poppins text-[12px]">
                  $200
                </p>
                <p className="text-[#FFFFFF6B] font-[400] font-poppins text-[12px] mt-2">
                  Mtn 2gb Sme.....
                </p>
                <p className="text-[#FF3D00] font-[400] font-poppins text-[12px] mt-3">
                  Failed
                </p>
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
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 mx-2 bg-[#1E1E1E] h-[500px] py-5 px-10 flex z-50 justify-between m-auto rounded-[15px] flex-col">
          <div className="flex justify-between items-start">
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-white font-[500] font-poppins text-[20px] ">
                Profile
              </p>
            </div>

            <div
              onClick={() => {
                setShowModal(false);
                setSelectedTransaction(null);
              }}
            >
              <CancelIcon />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-[14px] ">
              Name:
            </p>
            <p className="text-white font-[400]  font-poppins text-sm ">
              Nickson jay
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-[12px] ">
              Email:
            </p>
            <p className="text-white font-[400]  font-poppins text-[12px] ">
              examplegmail.com
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-sm ">
              Phone:
            </p>
            <p className={` font-[400] font-poppins text-sm text-white `}>
              9038483848
            </p>
          </div>
          <p className="text-white font-[500] font-poppins text-lg text-center ">
            Transaction detail
          </p>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-[12px] ">
              Amount:
            </p>
            <p className="text-white font-[400]  font-poppins text-[12px] ">
              $200
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-sm ">
              Transaction ID:
            </p>
            <p className={` font-[400] font-poppins text-sm text-white`}>
              HFHSHFDSUYFY
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400]  font-poppins text-sm ">
              Status:
            </p>
            <p className={` font-[400] font-poppins text-sm text-white `}>
              Successful
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-white font-[400] font-poppins text-sm ">
              Date & Time:
            </p>
            <p className="text-white font-[400] font-poppins text-sm ">
              {formatDate("")}
            </p>
          </div>
          <div className="flex justify-between items-center mt-6 w-full ">
            <p className="text-white font-[600] flex justify-center items-center font-poppins text-sm ">
              ✅ Approve
            </p>
            <p className="text-white font-[600]  flex justify-center items-center font-poppins text-sm ">
              🔄 Refund
            </p>
            <p className="text-white font-[600]  flex justify-center items-center font-poppins text-sm ">
              ❌ Reverse
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
