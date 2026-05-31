import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Student_Dashboard() {
  const navigate = useNavigate();
  const [activeTab] = useState("Dashboard");

  // State arrays configured exactly like the requested database format
  const [todoTasks, setTodoTasks] = useState([
    { id: 1, title: "Poetry Analysis", subject: "English 103", dueDate: "Due today, 11:59 PM", instructions: "Write a 1000-word poetry analysis essay discussing the poem's themes, tone, and literary devices..." }
  ]); 

  const [gradedEssays, setGradedEssays] = useState([
    { id: 1, title: "The Great Gatsby", score: "95", gradedDate: "May 30, 2026", subject: "English 103", submittedDate: "May 20, 2026, 11:45 PM", wordCount: "120", content: "In The Great Gatsby...", feedback: "Excellent structural overview..." }
  ]);

  // Detail View Active Overlays State
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEssay, setSelectedEssay] = useState(null);

  // Structural student navigation tabs
  const sidebarItems = ["Dashboard", "Documents", "Trash", "Settings"];

  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/student_dashboard");
    if (item === "Documents") navigate("/student_documents");
    if (item === "Trash") navigate("/student_trash");
    if (item === "Settings") navigate("/student_settings");
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

          <div className="flex items-center justify-between pt-5 px-6 border-t border-white/10 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto box-border pr-2 pb-6">
          
          {/* DETAILED OVERLAY PANEL FOR CLICKED TO-DO TASKS (image_add85e.png structure) */}
          {selectedTask ? (
            <div className="flex flex-col w-full relative animate-fadeIn pr-4">
              
              {/* Core Headings Frame */}
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col">
                  <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-none">
                    Welcome back, Juan!
                  </h1>
                  <p className="text-sm font-semibold text-slate-600 mt-1.5 ml-0.5">
                    Here's what's happening with your tasks.
                  </p>
                </div>
                
                {/* ✕ Button placed OUTSIDE the card layout container */}
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-700 hover:text-slate-900 font-bold text-xl mt-4 mr-2 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Main Rounded White Content Frame Panel */}
              <div className="bg-white border border-[#cbd5e1]/50 rounded-2xl shadow-sm p-8 mt-6 flex flex-col min-h-[300px]">
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedTask.title}</h2>
                    <span className="text-base font-medium text-slate-500 mt-0.5">{selectedTask.subject}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">
                    {selectedTask.dueDate}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-400 tracking-wide uppercase">Instructions:</span>
                  <p className="text-base text-slate-600 leading-relaxed font-normal">
                    {selectedTask.instructions}
                  </p>
                </div>
              </div>

              {/* Open Editor & Submit Action buttons placed OUTSIDE the card container bottom margin area */}
              <div className="flex items-center justify-end gap-4 mt-6">
                <button className="bg-white border border-slate-200 text-slate-700 font-medium py-2 px-6 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  Open Editor
                </button>
                <button className="bg-white border border-slate-200 text-slate-700 font-medium py-2 px-6 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  Submit
                </button>
              </div>
            </div>

          /* DETAILED OVERLAY PANEL FOR CLICKED RECENT GRADED ESSAYS (image_add87c.png structure) */
          ) : selectedEssay ? (
            <div className="flex flex-col gap-4 animate-fadeIn pr-4 relative">
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col">
                  <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-none">
                    {selectedEssay.title}
                  </h1>
                  <p className="text-sm font-medium text-slate-600 mt-2 ml-0.5">
                    {selectedEssay.subject} . Submitted: {selectedEssay.submittedDate} . {selectedEssay.wordCount} words
                  </p>
                </div>
                
                {/* Simplified x button replaced text route redirect labels */}
                <button 
                  onClick={() => setSelectedEssay(null)}
                  className="text-slate-700 hover:text-slate-900 font-bold text-xl mt-4 mr-2 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm min-h-[400px] text-slate-700 leading-relaxed font-normal text-base whitespace-pre-wrap">
                  {selectedEssay.content}
                </div>

                <div className="flex flex-col gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[120px]">
                    <h3 className="text-xl font-bold text-slate-400 tracking-tight mb-2">Score</h3>
                    <span className="text-4xl font-extrabold text-emerald-600">{selectedEssay.score}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[250px]">
                    <h3 className="text-xl font-bold text-slate-400 tracking-tight mb-2">Feedback</h3>
                    <p className="text-slate-600 font-normal text-sm leading-relaxed">
                      {selectedEssay.feedback || "No feedback structural comments assigned yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          /* BASE DASHBOARD LAYOUT GRID ROOT VIEW */
          ) : (
            <>
              <div>
                <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-none">
                  Welcome back, Juan!
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1.5 ml-0.5">
                  Here's what's happening with your tasks.
                </p>
              </div>

              {/* TO-DO ASSIGNMENT BLOCK */}
              <div className="flex flex-col gap-2 w-full max-w-[450px]">
                <h3 className="text-xl font-bold text-slate-700 tracking-tight">To do</h3>
                
                {todoTasks.length === 0 ? (
                  <div className="bg-white border border-[#cbd5e1]/50 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-[140px] items-center justify-center p-4 text-slate-400 italic text-sm">
                    No tasks assigned yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {todoTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white border border-[#cbd5e1]/50 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col cursor-pointer hover:border-slate-400 transition duration-150"
                      >
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50/30">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-800 tracking-tight">{task.title}</span>
                            <span className="text-sm font-medium text-slate-500 mt-0.5">{task.subject}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {task.dueDate.split(',')[0]}
                          </span>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="text-sm text-slate-600 font-normal truncate">
                            {task.instructions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT GRADED ESSAYS GRID SYSTEM TABLE */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <h3 className="text-xl font-bold text-slate-700 tracking-tight">Recent Graded Essay</h3>
                
                <div className="w-full bg-white border border-[#cbd5e1]/50 rounded-xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-3 border-b border-[#cbd5e1]/40 bg-slate-50/50 text-slate-500 font-semibold text-sm py-3.5 px-6">
                    <div>Assignment</div>
                    <div className="text-center">Score</div>
                    <div className="text-right">Date Graded</div>
                  </div>

                  {/* Empty state conditional renderer wrapper */}
                  {gradedEssays.length === 0 ? (
                    <div className="flex items-center justify-center h-28 bg-white text-slate-400 italic text-sm">
                      No recently graded essays.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {gradedEssays.map((essay) => (
                        <div 
                          key={essay.id}
                          onClick={() => setSelectedEssay(essay)}
                          className="grid grid-cols-3 items-center text-slate-700 font-medium text-base py-4 px-6 bg-white cursor-pointer hover:bg-slate-50/80 transition-colors duration-150"
                        >
                          <div className="text-slate-800 font-semibold">{essay.title}</div>
                          <div className="text-center font-bold text-emerald-600">{essay.score}</div>
                          <div className="text-right text-sm text-slate-500">{essay.gradedDate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}