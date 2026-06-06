import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Teacher_create_task() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState(100);
  const [topic, setTopic] = useState("No Topic");
  const [dueDate, setDueDate] = useState("No Due Date");
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#c5ecff] p-6 font-sans overflow-hidden box-border">
      {/* Header with Logo - Same as Essay Editor */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/teacher_dashboard")}
          title="Go Back"
          className="bg-transparent border-none p-0 m-0 cursor-pointer transition-all duration-200 hover:opacity-80 flex items-center focus:outline-none active:scale-95"
        >
          <img
            src="/logo.png"
            alt="AESkolar Logo - Go Back"
            className="h-16 w-auto object-contain"
          />
        </button>
        <div className="flex flex-col">
          <span className="text-[44px] font-bold text-[#1e293b] tracking-tight leading-none">
            AESkolar
          </span>
          <span className="text-xs text-[#475569] mt-0.5 ml-1">
            Teacher Workspace • write better, learn smarter.
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-custom">
          {/* Title Input */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-3xl font-semibold border-none outline-none text-[#1e293b] placeholder-[#cbd5e1]"
            />
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1 flex flex-col overflow-hidden">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions (Optional)"
              className="flex-1 w-full resize-none border-none outline-none text-sm text-[#475569] placeholder-[#cbd5e1] bg-transparent"
            />
          </div>

          {/* Attach Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1e293b] mb-4">Attach</h3>
            <div className="flex gap-20 justify-center">
                {[ 
                {name: "Drive", img: "/drive.png"}, 
                {name: "YouTube", img: "/youtube.png"}, 
                {name: "Create", img: "/plus.png"}, 
                {name: "Upload", img: "/upload.png"}, 
                {name: "Link", img: "/link.png"} 
                ].map((item) => (
                <button key={item.name} className="flex flex-col items-center gap-2 transition-transform cursor-pointer hover:scale-110">
                    <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                    <img src={item.img} alt={item.name} className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-xs font-medium text-[#475569]">{item.name}</span>
                </button>
                ))}
            </div>
            </div>
        </div>

        {/* Right Sidebar - White Container Style */}
        <div className="w-80 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-sm border border-slate-200">
        
        {/* Rubric */}
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-[#1e293b] text-sm">Rubric</h3>
            <button className="w-full bg-white text-slate-800 font-medium py-2 px-4 border border-[#cbd5e1] rounded-lg shadow-sm text-sm hover:border-[#7ba4cc] active:scale-95 cursor-pointer transition-all">
            + Rubric
            </button>
        </div>

        {/* Points */}
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-[#1e293b] text-sm">Points</h3>
            <div className="relative">
            <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full p-2 border border-[#cbd5e1] rounded-lg outline-none hover:border-[#7ba4cc] focus:border-[#7ba4cc]"
            />
            </div>
        </div>

        {/* Topic */}
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-[#1e293b] text-sm">Topic</h3>
            <div className="relative">
            <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 border border-[#cbd5e1] rounded-lg outline-none hover:border-[#7ba4cc] focus:border-[#7ba4cc] bg-white cursor-pointer appearance-none"
            >
                <option>No Topic</option>
                <option>Math</option>
                <option>Science</option>
            </select>
            </div>
        </div>

        {/* Due Date (Kept fully functional) */}
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-[#1e293b] text-sm">Due</h3>
            <div className="relative">
            <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full p-2 border border-[#cbd5e1] rounded-lg text-left bg-white hover:border-[#7ba4cc] cursor-pointer transition-all"
            >
                {dueDate}
            </button>
            {showDatePicker && (
                <div className="absolute top-full mt-2 z-50 bg-white border border-[#cbd5e1] rounded-lg shadow-lg p-2 cursor-pointer">
                <input
                    type="date"
                    onChange={(e) => {
                    const date = new Date(e.target.value);
                    setDueDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
                    setShowDatePicker(false);
                    }}
                    className="w-full border p-1 rounded cursor-pointer"
                />
                </div>
            )}
            </div>
        </div>

        {/* Assign Button */}
        <button className="mt-auto w-full bg-white border-2 border-slate-300 rounded-lg py-3 font-semibold text-slate-800 hover:border-[#7ba4cc] active:scale-95 cursor-pointer transition-all">
            Assign
        </button>
        </div>
      </div>
    </div>
  );
}
