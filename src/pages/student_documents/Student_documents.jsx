import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSession,
  fetchDocuments,
  searchDocuments,
  uploadDocumentFromFile,
  moveDocumentToTrash,
  downloadDocumentContent,
} from "../../services/api.js";
import SidebarProfileIcon from "../../components/SidebarProfileIcon.jsx";

export default function Student_Documents() {
  const navigate = useNavigate();
  const [activeTab] = useState("Documents");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Clean layout matching student views (Including Settings tab now)
  const sidebarItems = ["Dashboard", "Documents", "Trash", "Settings"];

  const handleNavigation = (item) => {
    if (item === "Dashboard") navigate("/student_dashboard");
    if (item === "Documents") navigate("/student_documents");
    if (item === "Trash") navigate("/student_trash");
    if (item === "Settings") navigate("/student_settings");
  };

  const handleCreateDocument = () => {
    navigate("/student_essay_editor");
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const { session } = await getSession();
    if (!session) {
      setErrorMessage("Please sign in again.");
      setIsLoading(false);
      navigate("/sign_in");
      return;
    }
    const filters = {
      userId: session.user.id,
      role: "student",
    };
    const { data, error } = searchQuery.trim()
      ? await searchDocuments({ ...filters, query: searchQuery.trim(), excludeStatus: "trash" })
      : await fetchDocuments(filters);
    if (error) {
      setErrorMessage(error.message || "Failed to load documents.");
      setDocuments([]);
    } else {
      setDocuments(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [searchQuery]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = null;
    if (!file) return;
    setIsLoading(true);
    setErrorMessage("");
    const { session } = await getSession();
    if (!session) {
      setErrorMessage("Upload failed. Please sign in again.");
      setIsLoading(false);
      return;
    }
    const { error } = await uploadDocumentFromFile(session.user.id, "student", file);
    if (error) setErrorMessage(error.message || "Upload failed.");
    else await loadDocuments();
    setIsLoading(false);
  };

  const handleDownload = (file) => {
    downloadDocumentContent(file);
    setActiveMenuId(null);
  };

  const handleDelete = async (file) => {
    const { error } = await moveDocumentToTrash(file.id);
    if (error) alert(error.message || "Could not move to trash.");
    else await loadDocuments();
    setActiveMenuId(null);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Search Engine Pill Bar */}
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className="flex-1 h-full flex flex-col gap-8 overflow-y-auto box-border pr-2 pb-6">
          
          <div>
            <h1 className="text-[54px] font-bold text-[#1e293b] tracking-tight leading-tight">
              Documents
            </h1>
          </div>

          {errorMessage && (
            <p className="text-red-600 text-sm -mt-4">{errorMessage}</p>
          )}

          <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />

          {/* Operational Core Utility Action Row Grid with Hover Effects */}
          <div className="flex items-center gap-6">
            <button 
              onClick={handleCreateDocument}
              className="bg-white text-slate-800 font-medium py-3 px-8 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] cursor-pointer text-base transition-all duration-150 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              Create Document
            </button>
            <button
              onClick={handleUploadClick}
              className="bg-white text-slate-800 font-medium py-3 px-8 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.04)] cursor-pointer text-base transition-all duration-150 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              Upload File
            </button>
          </div>

          {/* CONDITIONAL CONTENT VIEWPORT DISPLAY */}
          {isLoading ? (
            <p className="text-slate-600 text-sm">Loading documents...</p>
          ) : documents.length === 0 ? (
            
            /* EMPTY VIEW PORT */
            <div className="flex-1 flex flex-col items-center justify-center pr-24 pb-20 select-none animate-fadeIn">
              <h2 className="text-[44px] font-medium text-[#000000] tracking-tight mb-1 text-center">
                Nothing here yet
              </h2>
              <p className="text-[11px] font-bold text-[#000000]/70 tracking-wide text-center leading-normal">
                Your docs will appear here once you start one.<br />
                Start writing a new doc.
              </p>
            </div>

          ) : (

            /* STANDARD POPULATED GRID CARD VIEW PORT */
            <div className="flex flex-col gap-4 mt-2 animate-fadeIn">
              <h2 className="text-[32px] font-medium text-[#1e293b]/90 tracking-tight">
                Recent
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {documents.map((file) => (
                  <div 
                    key={file.id}
                    className="bg-white border border-[#cbd5e1]/60 rounded-xl shadow-sm h-56 w-full flex flex-col relative overflow-visible transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-[#cbd5e1]/50 px-4 py-3 bg-slate-50/50 rounded-t-xl">
                      <span className="text-lg font-medium text-[#334155] truncate max-w-[130px]">
                        {file.title}
                      </span>
                      
                      <div className="relative" ref={activeMenuId === file.id ? dropdownRef : null}>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === file.id ? null : file.id)}
                          className="flex items-center gap-1 bg-[#7ba4cc]/20 hover:bg-[#7ba4cc]/40 px-2 py-1.5 rounded-md border border-[#7ba4cc]/30 transition-all cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 bg-[#7ba4cc] rounded-full inline-block"></span>
                          <span className="w-2.5 h-2.5 bg-[#cbd5e1] rounded-full inline-block"></span>
                        </button>

                        {activeMenuId === file.id && (
                          <div className="absolute left-full top-0 ml-1 z-30 w-32 bg-[#7ba4cc] border border-[#6993bc] rounded-lg shadow-lg overflow-hidden flex flex-col transform origin-top-left transition-all duration-100">
                            <button 
                              onClick={() => {
                                navigate("/student_essay_editor", {
                                  state: { documentId: file.id, title: file.title, content: file.content },
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#1e293b] font-medium hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                            <button 
                              onClick={() => handleDownload(file)}
                              className="w-full text-left px-4 py-2 text-sm text-[#1e293b] font-medium hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              Download
                            </button>
                            <button 
                              onClick={() => handleDelete(file)}
                              className="w-full text-left px-4 py-2 text-sm text-[#1e293b] font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 bg-white rounded-b-xl"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}