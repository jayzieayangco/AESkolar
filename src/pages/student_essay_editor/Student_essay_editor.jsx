import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/client"; // Path to your Supabase client setup

export default function Student_essay_editor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [essayText, setEssayText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDraft = async () => {
    if (!title.trim() && !essayText.trim()) {
      alert("Please add a title or content before saving your draft.");
      return;
    }

    try {
      setIsSaving(true);

      // 1. Get current logged-in student session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert("Your session has expired. Please sign in again.");
        navigate("/signin");
        return;
      }

      // 2. Insert or Upsert draft data into Supabase
      const { error } = await supabase
        .from("documents") // Swap this with your actual database table name if different
        .insert([
          {
            title: title || "Untitled Draft",
            content: essayText,
            user_id: session.user.id,
            role: "student",
            status: "draft",
            updated_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      console.log("Student Draft successfully saved to database.");
      
      // 3. Smoothly navigate back to the student documents overview page
      navigate("/student_documents");

    } catch (error) {
      console.error("Database Save Error:", error.message);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#c5ecff] p-6 gap-6 font-sans overflow-hidden box-border">
      
      {/* LEFT SIDE: Input Workspace */}
      <div className="flex flex-col flex-1 h-full gap-4">
        
        {/* Header / Logo Area */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="AESkolar Logo" 
            className="h-16 w-auto object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="flex flex-col">
            <span className="text-[44px] font-bold text-[#1e293b] tracking-tight leading-none">
              AESkolar
            </span>
            <span className="text-xs text-[#475569] mt-0.2 ml-1">
              Student Workspace • write better, learn smarter.
            </span>
          </div>
        </div>

        {/* Essay Title Input */}
        <input
          type="text"
          placeholder="Input Title Here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#dcf2fe] border border-[#a6d5fa] rounded-lg py-3 px-4 text-center text-lg font-medium text-[#334155] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7dd3fc]"
        />

        {/* Big Essay Text Area Input */}
        <textarea
          placeholder="Start typing your essay here..."
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          className="w-full flex-1 bg-white border border-[#a6d5fa] rounded-lg p-6 text-base text-[#334155] placeholder-[#94a3b8] resize-none focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] overflow-y-auto leading-relaxed shadow-sm"
        />

        {/* Action Buttons Footer */}
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

      {/* RIGHT SIDE: Evaluation Panel */}
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