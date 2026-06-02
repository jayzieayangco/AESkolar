import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "../../services/api.js";
import { useDebouncedDocumentSave } from "../../hooks/useDebouncedDocumentSave.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

export default function Student_essay_editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTitle = location.state?.title ?? "";
  const initialContent = location.state?.content ?? "";

  const [title, setTitle] = useState(initialTitle);
  const [essayText, setEssayText] = useState(initialContent);
  const [documentId, setDocumentId] = useState(location.state?.documentId ?? null);
  const [assignmentTaskId] = useState(location.state?.taskId ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const savedSnapshot = useRef({ title: initialTitle, content: initialContent });

  const isDirty =
    title !== savedSnapshot.current.title || essayText !== savedSnapshot.current.content;

  const { confirmIfDirty } = useUnsavedChanges(isDirty);

  const handleStatus = (status, msg) => {
    if (status === "saving") setSaveStatus("Saving...");
    if (status === "saved") {
      setSaveStatus("Success!");
      savedSnapshot.current = { title, content: essayText };
      setTimeout(() => setSaveStatus(""), 2000);
    }
    if (status === "error") setSaveStatus(msg || "Failed to save draft.");
  };

  const { saveNow } = useDebouncedDocumentSave(
    { title, content: essayText, documentId, role: "student", assignmentTaskId },
    { enabled: true, debounceMs: 2000, onStatus: handleStatus }
  );

  useEffect(() => {
    getSession().then(({ session }) => {
      if (!session) navigate("/sign_in");
    });
  }, [navigate]);

  const handleBack = () => {
    if (!confirmIfDirty()) return;
    navigate(-1);
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !essayText.trim()) {
      alert("Please add a title or content before saving your draft.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus("Saving...");
      const id = await saveNow();
      if (id) setDocumentId(id);
      savedSnapshot.current = { title, content: essayText };
      if (!saveStatus.includes("Failed")) {
        setSaveStatus("Success!");
        setTimeout(() => navigate("/student_documents"), 600);
      }
    } catch (error) {
      alert(error.message || "Failed to save draft. Please try again.");
      setSaveStatus("Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#c5ecff] p-6 gap-6 font-sans overflow-hidden box-border">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            title="Go Back"
            className="bg-transparent border-none p-0 m-0 cursor-pointer transition-all duration-200 hover:opacity-80 flex items-center focus:outline-none"
          >
            <img
              src="/logo.png"
              alt="AESkolar Logo - Go Back"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </button>
          <div className="flex flex-col flex-1">
            <span className="text-[44px] font-bold text-[#1e293b] tracking-tight leading-none">
              AESkolar
            </span>
            <span className="text-xs text-[#475569] mt-0.2 ml-1">
              Student Workspace • write better, learn smarter.
            </span>
          </div>
          {saveStatus && (
            <span
              className={`text-sm font-medium ${
                saveStatus.toLowerCase().includes("fail") ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {saveStatus}
            </span>
          )}
        </div>

        <input
          type="text"
          placeholder="Input Title Here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#dcf2fe] border border-[#a6d5fa] rounded-lg py-3 px-4 text-center text-lg font-medium text-[#334155] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7dd3fc]"
        />

        <textarea
          placeholder="Start typing your essay here..."
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          className="w-full flex-1 bg-white border border-[#a6d5fa] rounded-lg p-6 text-base text-[#334155] placeholder-[#94a3b8] resize-none focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] overflow-y-auto leading-relaxed shadow-sm"
        />

        <div className="flex items-center justify-between pb-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="bg-white text-slate-800 font-medium py-2.5 px-6 border border-[#cbd5e1] rounded-md shadow-sm cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <div className="text-xs font-medium text-[#475569]">
            Word Count: {essayText.trim() === "" ? 0 : essayText.trim().split(/\s+/).length}
          </div>
        </div>
      </div>

      <div className="w-[340px] md:w-[380px] h-full flex flex-col gap-4">
        <div className="flex-1 bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Overall Score</h2>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
            <span className="text-sm text-[#64748b] text-center px-4">
              Submit your essay to compute the scoring rubrics matrix.
            </span>
          </div>
        </div>

        <div className="h-[250px] bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold text-[#1e293b] mb-3">Review Suggestion</h2>
          <div className="flex-1 overflow-y-auto text-sm text-[#475569] leading-relaxed pr-1">
            <p className="text-[#94a3b8] italic">No suggestions available yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
