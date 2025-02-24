import React, { useState, useEffect } from "react";
import DesktopImage from "../../assets/images/bold-data.png";
// import { useNavigate } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowDownIcon } from "../../assets/svg";

const Dashboard = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  //   const navigate = useNavigate();

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
        <div className="min-h-screen w-full bg-black pt-7 px-4">
          <p className="text-white font-[500]  font-poppins text-2xl mb-3">
            Dashboard
          </p>
          <div className="flex gap-2 items-center mb-5">
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
          <div className="flex flex-col items-center justify-between gap-4 relative pt-5">
            <div className="w-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide ">
              <div
                id="sliderItem"
                className="w-[50%] relative overflow-hidden shadow-md pb-2 rounded-md hover:cursor-pointer inline-block hover:scale-105 ease-in-out duration-300 mr-3"
              >
                <div className=" bg-[#7878801F]  h-fit rounded-[15px]  p-4 max-sm:p-2 ">
                  <p className="font-[400] font-[Poppins] text-[12px]   text-[#FFFFFF] whitespace-normal">
                    📊 Total Revenue
                  </p>
                  <p className="font-[400] font-[Poppins] text-[20px]  text-[#FFFFFF] whitespace-normal">
                    $200
                  </p>
                </div>
              </div>
              <div
                id="sliderItem"
                className="w-[50%]  relative overflow-hidden shadow-md pb-2 rounded-md hover:cursor-pointer inline-block hover:scale-105 ease-in-out duration-300 mx-3"
              >
                <div className=" bg-[#7878801F]  h-fit rounded-[15px]  p-4 max-sm:p-2 ">
                  <p className="font-[400] font-[Poppins] text-[12px]   text-[#FFFFFF] whitespace-normal">
                    📊 Total Revenue
                  </p>
                  <p className="font-[400] font-[Poppins] text-[20px]  text-[#FFFFFF] whitespace-normal">
                    $200
                  </p>
                </div>
              </div>
              <div
                id="sliderItem"
                className="w-[50%]  relative overflow-hidden shadow-md pb-2 rounded-md hover:cursor-pointer inline-block hover:scale-105 ease-in-out duration-300 mx-3"
              >
                <div className=" bg-[#7878801F]  h-fit rounded-[15px]  p-4 max-sm:p-2 ">
                  <p className="font-[400] font-[Poppins] text-[12px]   text-[#FFFFFF] whitespace-normal">
                    📊 Total Revenue
                  </p>
                  <p className="font-[400] font-[Poppins] text-[20px]  text-[#FFFFFF] whitespace-normal">
                    $200
                  </p>
                </div>
              </div>
              <div
                id="sliderItem"
                className="w-[50%]  relative overflow-hidden shadow-md pb-2 rounded-md hover:cursor-pointer inline-block hover:scale-105 ease-in-out duration-300 mx-3"
              >
                <div className=" bg-[#7878801F]  h-fit rounded-[15px]  p-4 max-sm:p-2 ">
                  <p className="font-[400] font-[Poppins] text-[12px]   text-[#FFFFFF] whitespace-normal">
                    📊 Total Revenue
                  </p>
                  <p className="font-[400] font-[Poppins] text-[20px]  text-[#FFFFFF] whitespace-normal">
                    $200
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-white font-[400] font-poppins text-lg my-3">
            Recent transaction
          </p>
          <div className="flex justify-start gap-4 items-center">
            <div className="bg-[#1A1617] w-[95%] px-2 py-4 flex justify-between rounded-[8px] items-center">
              <div className="flex justify-start gap-2 items-center">
                <ArrowDownIcon />
                <div>
                  <p className="text-white font-[400] font-poppins text-[12px]">
                    Nickson jay
                  </p>
                  <p className="text-white font-[400] font-poppins text-[10px] mt-2">
                    234903681436
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-white font-[400] font-poppins text-[10px]">
                  Mtn 2gb
                </p>
                <p className="text-[#FFFFFF6B] font-[400] font-poppins text-[10px] mt-2">
                  <span className="text-[#008000]">$200</span>
                  20 jan, 2025 12:30pm
                </p>
              </div>
            </div>
            <div className="flex justify-center w-[5%] items-center gap-1">
              <div className="h-[5px] w-[5px] rounded-sm border border-white">
                {" "}
              </div>
              <div className="h-[5px] w-[5px] rounded-sm border border-white">
                {" "}
              </div>
              {/* <div className="h-[5px] w-[5px] rounded-sm border border-white">
                {" "}
              </div> */}
            </div>
          </div>
        </div>
      ) : (
        // JSX for screens above 768px
        <div className="min-h-screen w-full gap-4 bg-black p-5 flex flex-col justify-between">
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
    </div>
  );
};

export default Dashboard;
