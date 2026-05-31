import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/client";

export default function Teacher_Settings() {
  const navigate = useNavigate();
  const [activeTab] = useState("Settings");

  // Form State Configurations
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Teacher navigation items
  const sidebarItems = ["Dashboard", "Documents", "Grade Essays", "Trash", "Settings"];

  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/teacher_dashboard");
    if (item === "Documents") navigate("/teacher_documents");
    if (item === "Grade Essays") navigate("/teacher_grade_essay");
    if (item === "Trash") navigate("/teacher_trash");
    if (item === "Settings") navigate("/teacher_settings");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    alert("Saving changes...");
  };

  // Triggers real Supabase session termination after confirming
  const handleLogout = async () => {
    const confirmsLogout = window.confirm("Are you sure you want to log out?");
    if (confirmsLogout) {
      try {
        // 1. Terminate session on Supabase backend and clear auth cookies/tokens
        await supabase.auth.signOut();

        // 2. Clear out safety flag used by your sign-in page listeners
        sessionStorage.removeItem("auth_processed");

        // 3. Clean routing back to the main landing page
        navigate("/");
      } catch (error) {
        console.error("Error signing out:", error);
        // Fallback redirection in case network drop occurs
        navigate("/");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#c5ecff] pt-6 font-sans overflow-hidden box-border gap-0 relative">
      
      {/* BRANDING HEADER AREA + SEARCH CONTAINER */}
      <div className="flex items-center justify-between pl-10 pb-4 pr-8">
        <div className="flex items-center gap-1.5">
          <img 
            src="/logo.png" 
            alt="AESkolar Logo" 
            className="fixed h-17 w-auto object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
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

        {/* Search Engine Pill Bar */}
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

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex flex-1 w-full gap-8 overflow-hidden items-stretch">
        
        {/* LEFT SIDEBAR PANEL */}
        <div className="w-[400px] bg-[#7ba4cc] flex flex-col justify-between py-8 pl-4 relative shadow-[5px_0_15px_rgba(0,0,0,0.05)] rounded-tr-2xl h-full box-border">
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

          {/* User Profile Control */}
          <div className="flex items-center justify-between pt-5 px-6 border-t border-white/10 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT SETTINGS WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto box-border pr-8 pb-28 animate-fadeIn">
          
          <div>
            <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-tight">
              Settings
            </h1>
          </div>

          {/* SETTINGS SPLIT PANEL */}
          <div className="flex gap-12 w-full mt-2 items-start">
            
            {/* ACCOUNT MANAGEMENT COLUMN */}
            <div className="flex flex-col gap-5 flex-1 max-w-xl">
              <h2 className="text-xl font-bold text-slate-800 tracking-wide select-none">
                Account Management
              </h2> 

              <div className="flex items-start gap-6 w-full">
                {/* Profile Picture Uploader Box */}
                <div className="w-48 h-48 bg-transparent border border-slate-400/60 rounded-xl flex flex-col items-center justify-center gap-3 p-4 bg-slate-50/10">
                  <span className="text-slate-700 text-sm font-medium">Profile Picture</span>
                  <button className="bg-white text-slate-800 font-medium py-1.5 px-6 rounded-lg shadow-sm border border-slate-200 text-xs transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Upload
                  </button>
                </div>

                {/* Input Fields Frame */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-700 text-sm font-medium">Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#c5ecff] border border-slate-400/60 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-500 transition-all text-sm shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-700 text-sm font-medium">Email</label>
                    <input 
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#c5ecff] border border-slate-400/60 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-500 transition-all text-sm shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VERTICAL DIVIDER LINE */}
            <div className="w-[1px] h-52 bg-slate-400/40 self-end mb-1"></div>

            {/* CHANGE PASSWORD COLUMN */}
            <div className="flex flex-col gap-5 w-64">
              <h2 className="text-xl font-bold text-slate-800 tracking-wide select-none">
                Change Password
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-700 text-sm font-medium">New Password</label>
                  <input 
                    type="password"
                    name="newPassword"
                    value={profile.newPassword}
                    onChange={handleInputChange}
                    className="w-full bg-[#c5ecff] border border-slate-400/60 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-500 transition-all text-sm shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-700 text-sm font-medium">Confirm Password</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-[#c5ecff] border border-slate-400/60 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-500 transition-all text-sm shadow-inner"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* LOWER PREFERENCES CAPTION AREA */}
          <div className="mt-4 border-t border-slate-400/20 pt-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-wide select-none">
              Preferences
            </h2>
          </div>

        </div>
      </div>

      {/* FIXED FOOTER CONTROLS ROW PANEL */}
      <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-transparent z-10">
        <button 
          onClick={handleSaveChanges}
          className="bg-white text-slate-800 font-medium py-2 px-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] text-base border border-slate-200 transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Save Changes
        </button>
        <button 
          onClick={handleLogout}
          className="bg-white text-slate-800 font-medium py-2 px-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] text-base border border-slate-200 transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Log out
        </button>
      </div>

    </div>
  );
}