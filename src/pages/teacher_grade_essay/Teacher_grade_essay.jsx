import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Teacher_Grade_Essay() {
  const navigate = useNavigate();
  const [activeTab] = useState("Grade Essays");
  
  // States for filter drop-downs
  const [selectedDate, setSelectedDate] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");

  const sidebarItems = ["Dashboard", "Documents", "Grade Essays", "Trash", "Settings"];

  // Centralized navigation routes mapping
  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/teacher_dashboard");
    if (item === "Documents") navigate("/teacher_documents");
    if (item === "Grade Essays") navigate("/teacher_grade_essay");
    if (item === "Trash") navigate("/teacher_trash");
    if (item === "Settings") navigate("/teacher_settings");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#c5ecff] pt-6 pr-6 font-sans overflow-hidden box-border gap-0">
      
      {/* BRANDING HEADER AREA + SEARCH CONTAINER */}
      <div className="flex items-center justify-between pl-10 pb-4 pr-2">
        <div className="flex items-center gap-1.5">
          <img 
            src="/logo.png" 
            alt="AESkolar Logo" 
            className="fixed h-17 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="flex flex-col justify-center ml-12">
            <span className="text-[32px] font-bold text-[#1e293b] tracking-tight leading-none">
              AESkolar
            </span>
            <span className="text-xs text-[#475569] mt-0.5 ml-0.5">
              write better, learn smarter.
            </span>
          </div>
        </div>

        {/* Search Engine Pill Bar - Fixed rectangle artifact by transferring shadow to input layer */}
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Search here" 
            className="w-full bg-white text-slate-700 pl-5 pr-11 py-2.5 rounded-full border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent text-base font-normal placeholder-slate-400 shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER LAYOUT (Sidebar + Content Workspace) */}
      <div className="flex flex-1 w-full gap-8 overflow-hidden">
        
        {/* LEFT SIDEBAR PANEL */}
        <div className="w-[400px] bg-[#7ba4cc] h-full flex flex-col justify-between py-8 pl-4 relative shadow-[5px_0_15px_rgba(0,0,0,0.05)] rounded-tr-2xl">
          <div className="flex flex-col w-full">
            <nav className="flex flex-col w-full gap-2.5 mt-20">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item;
                return (
                  <button
                    key={item}
                    onClick={() => handleNavigation(item)}
                    className={`w-full text-left py-4 px-10 text-2xl font-medium tracking-wide rounded-l-full transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#c5ecff] text-[#1e293b] font-bold pl-12 shadow-[-4px_4px_6px_rgba(0,0,0,0.05)]"
                        : "text-[#1e293b]/80 hover:text-[#1e293b] hover:bg-white/10 hover:pl-11"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Account Access Profile Control */}
          <div className="flex items-center justify-between pt-5 px-6 border-t border-white/10 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-[#1e293b]/70 font-bold text-xl select-none mr-2">&gt;</span>
          </div>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto box-border pr-2 pb-6">
          
          {/* Page Header */}
          <div>
            <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-none">
              Grade Essays
            </h1>
          </div>

          {/* FILTER ACTION ROW (Dropdowns and Export Button layout) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              
              {/* Date Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="appearance-none bg-white text-slate-700 py-2.5 pl-5 pr-10 border-0 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] cursor-pointer text-sm font-medium outline-none"
                >
                  <option value="">Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Secondary Variable Dropdown */}
              <div className="relative">
                <select
                  value={secondaryFilter}
                  onChange={(e) => setSecondaryFilter(e.target.value)}
                  className="appearance-none bg-white text-slate-700 py-2.5 pl-5 pr-10 border-0 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] min-w-[100px] h-[40px] cursor-pointer text-sm font-medium outline-none"
                >
                  <option value=""></option>
                  <option value="class-a">Class A</option>
                  <option value="class-b">Class B</option>
                  <option value="pending">Pending</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Export Utility Action Trigger Button */}
            <button className="bg-white text-slate-800 font-medium py-2.5 px-6 border-0 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
              Export
            </button>
          </div>

          {/* MAIN ESSAY VIEWPORT CANVAS FRAME PANEL */}
          <div className="w-full flex-1 bg-white border border-[#cbd5e1]/40 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {/* Header border segment matching wireframe design block */}
            <div className="h-14 border-b border-[#cbd5e1]/60 bg-white w-full"></div>
            
            {/* Inner Workspace Section Canvas */}
            <div className="flex-1 bg-white p-6 flex items-center justify-center text-slate-400 italic text-sm">
              {/* Content lists or table layers go here */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}