import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Teacher_Dashboard() {
  const navigate = useNavigate();
  const [activeTab] = useState("Dashboard");

  const sidebarItems = [
    "Dashboard",
    "Documents",
    "Grade Essays",
    "Trash",
    "Settings",
  ];

  // Centralized router handling using proper URL path strings
  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/teacher_dashboard");
    if (item === "Documents") navigate("/teacher_documents");
    if (item === "Trash") navigate("/teacher_trash");
    if (item === "Grade Essays") navigate("/teacher_grade_essay");
    if (item === "Settings") navigate("/teacher_settings");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#c5ecff] pt-6 pr-6 font-sans overflow-hidden box-border gap-0">
      {/* BRANDING HEADER AREA */}
      <div className="flex items-center gap-1.5 pl-10 pb-4">
        <img
          src="/logo.png"
          alt="AESkolar Logo"
          className="fixed h-17 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = "none";
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

      {/* MAIN CONTAINER LAYOUT */}
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

          {/* User Profile Avatar Container */}
          <div className="flex items-center justify-start pt-5 px-6 border-t border-white/10 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto box-border pr-2 pb-6">
          <div>
            <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight">
              Welcome back, Teacher!
            </h1>
            <p className="text-xs text-[#475569] tracking-wide">
              Here's what's happening with your tasks.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-white text-slate-800 font-medium py-2.5 px-6 border border-[#cbd5e1] rounded-xl shadow-sm cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
              Upload New Essays
            </button>
            <button className="bg-white text-slate-800 font-medium py-2.5 px-6 border border-[#cbd5e1] rounded-xl shadow-sm cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
              Upload Rubric
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[#1e293b] tracking-wide">
              Class Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-[#cbd5e1] rounded-xl p-5 shadow-sm h-28 flex flex-col justify-start">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider text-center w-full">
                  Total Graded
                </span>
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2"></span>
              </div>
              <div className="bg-white border border-[#cbd5e1] rounded-xl p-5 shadow-sm h-28 flex flex-col justify-start">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider text-center w-full">
                  Pending
                </span>
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2"></span>
              </div>
              <div className="bg-white border border-[#cbd5e1] rounded-xl p-5 shadow-sm h-28 flex flex-col justify-start">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider text-center w-full">
                  Flagged for Review
                </span>
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2"></span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-[250px]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1e293b] tracking-wide">
                Student Submission List
              </h2>
              <button className="bg-white text-slate-800 font-medium py-1.5 px-4 border border-[#cbd5e1] rounded-lg shadow-sm cursor-pointer text-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
                Export Grades
              </button>
            </div>

            <div className="w-full flex-1 bg-white border border-[#cbd5e1] rounded-xl shadow-sm overflow-hidden flex flex-col">
              <table className="w-full border-collapse text-left flex-1 flex flex-col">
                <thead className="bg-slate-50 border-b border-[#cbd5e1] w-full block">
                  <tr className="flex w-full">
                    <th className="flex-1 py-3 px-6 text-sm font-semibold text-[#334155]">
                      Student Name
                    </th>
                    <th className="w-32 py-3 px-6 text-sm font-semibold text-[#334155] text-center">
                      Score
                    </th>
                    <th className="w-48 py-3 px-6 text-sm font-semibold text-[#334155] text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="w-full flex-1 overflow-y-auto block bg-white">
                  <tr className="flex w-full border-b border-slate-50 text-slate-400 text-sm italic items-center justify-center h-32">
                    <td>No active student submissions loaded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
