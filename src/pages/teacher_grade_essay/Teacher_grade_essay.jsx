import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getSession,
  getDocuments,
  getDocumentById,
  submitEvaluation,
  updateDocument,
  listEvaluations,
  releaseScore,
} from "../../services/api.js";
import SidebarProfileIcon from "../../components/SidebarProfileIcon.jsx";

export default function Teacher_Grade_Essay() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab] = useState("Grade Essays");
  const [selectedDate, setSelectedDate] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [essays, setEssays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [lastEvaluationId, setLastEvaluationId] = useState(null);
  const [gradeMessage, setGradeMessage] = useState("");

  const sidebarItems = ["Dashboard", "Documents", "Grade Essays", "Trash", "Settings"];

  // Centralized navigation routes mapping
  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/teacher_dashboard");
    if (item === "Documents") navigate("/teacher_documents");
    if (item === "Grade Essays") navigate("/teacher_grade_essay");
    if (item === "Trash") navigate("/teacher_trash");
    if (item === "Settings") navigate("/teacher_settings");
  };

  const loadEssays = async () => {
    const { session } = await getSession();
    if (!session) {
      navigate("/sign_in");
      return;
    }
    const { data: submitted } = await getDocuments({ role: "student", status: "submitted" });
    const { data: scored } = await getDocuments({ role: "student", status: "scored" });
    let list = [...(submitted ?? []), ...(scored ?? [])];
    if (secondaryFilter === "pending") {
      list = list.filter((e) => e.status === "submitted" || e.status === "scored");
    }
    setEssays(list);
    if (location.state?.essayId) {
      const { data: doc } = await getDocumentById(location.state.essayId);
      if (doc) {
        setSelected(doc);
        const { data: evals } = await listEvaluations({ essayId: doc.id });
        if (evals?.[0]) setLastEvaluationId(evals[0].id);
      }
    }
  };

  useEffect(() => {
    loadEssays();
  }, [selectedDate, secondaryFilter]);

  const handleGrade = async () => {
    if (!selected || !score) {
      alert("Select an essay and enter a score.");
      return;
    }
    try {
      setIsGrading(true);
      const { data: result, error } = await submitEvaluation({
        essayId: selected.id,
        totalScore: Number(score),
        suggestions: feedback,
        strengths: feedback,
        feedbackSuggestions: feedback,
      });
      if (error) throw error;
      const evaluationId = result?.evaluation?.id;
      if (evaluationId) {
        setLastEvaluationId(evaluationId);
        await updateDocument(selected.id, { status: "scored" });
        setGradeMessage("Score saved. Click Release Score to show the student.");
      }
    } catch (err) {
      alert(err.message || "Grading failed.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleSelectEssay = async (essay) => {
    setSelected(essay);
    setScore("");
    setFeedback("");
    setGradeMessage("");
    const { data: evals } = await listEvaluations({ essayId: essay.id });
    setLastEvaluationId(evals?.[0]?.id ?? null);
  };

  const handleRelease = async () => {
    if (!lastEvaluationId) {
      alert("Save a grade first before releasing.");
      return;
    }
    try {
      setIsReleasing(true);
      const { error } = await releaseScore(lastEvaluationId);
      if (error) throw error;
      setGradeMessage("Score released! Student can now see their grade.");
      loadEssays();
    } catch (err) {
      alert(err.message || "Release failed.");
    } finally {
      setIsReleasing(false);
    }
  };

  const handleExport = () => {
    const csv = essays.map((e) => `${e.title},${e.status},${e.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "essays-export.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            <SidebarProfileIcon />
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
            <button
              onClick={handleExport}
              className="bg-white text-slate-800 font-medium py-2.5 px-6 border-0 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              Export
            </button>
          </div>

          {/* MAIN ESSAY VIEWPORT CANVAS FRAME PANEL */}
          <div className="w-full flex-1 bg-white border border-[#cbd5e1]/40 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {/* Header border segment matching wireframe design block */}
            <div className="h-14 border-b border-[#cbd5e1]/60 bg-white w-full"></div>
            
            {/* Inner Workspace Section Canvas */}
            <div className="flex-1 bg-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto min-h-0">
              <div className="border border-slate-100 rounded-lg p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Submissions</h3>
                {essays.length === 0 ? (
                  <p className="text-slate-400 italic text-sm">No essays to grade.</p>
                ) : (
                  essays.map((essay) => (
                    <button
                      key={essay.id}
                      type="button"
                      onClick={() => handleSelectEssay(essay)}
                      className={`block w-full text-left p-3 mb-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                        selected?.id === essay.id
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      {essay.title}
                    </button>
                  ))
                )}
              </div>
              <div className="border border-slate-100 rounded-lg p-4 flex flex-col min-h-[280px]">
                {selected ? (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{selected.title}</h3>
                    <div className="flex-1 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap border border-slate-100 rounded p-3 mb-3">
                      {selected.content || "No content."}
                    </div>
                    <input
                      type="number"
                      placeholder="Score"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2 text-sm"
                    />
                    <textarea
                      placeholder="Feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 h-24 resize-none text-sm"
                    />
                    {gradeMessage && (
                      <p className="text-sm text-emerald-700 mb-2">{gradeMessage}</p>
                    )}
                    <div className="flex gap-2 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={handleGrade}
                        disabled={isGrading}
                        className="bg-slate-800 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        {isGrading ? "Saving..." : "Submit Grade"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRelease}
                        disabled={isReleasing || !lastEvaluationId}
                        className="bg-white text-slate-800 border border-slate-300 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-slate-50"
                      >
                        {isReleasing ? "Releasing..." : "Release Score"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 italic text-sm m-auto">Select an essay to grade.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}