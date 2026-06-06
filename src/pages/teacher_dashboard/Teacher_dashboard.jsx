import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSession,
  getUserProfile,
  fetchTeacherSubmissions,
  createAssignmentTask,
  createRubricWithValidation,
  fetchTeacherAssignmentTasks,
  updateAssignmentTask,
  deleteAssignmentTask,
  listAssignmentTasks,
} from "../../services/api.js";
import AppPageHeader from "../../components/AppPageHeader.jsx";
import SidebarNav from "../../components/SidebarNav.jsx";
import SidebarProfileRow from "../../components/SidebarProfileRow.jsx";
import { formatDocumentStatus } from "../../utils/statusDisplay.js";

export default function Teacher_Dashboard() {
  const navigate = useNavigate();
  const [activeTab] = useState("Dashboard");
  const [userName, setUserName] = useState("Teacher");
  const [stats, setStats] = useState({ graded: 0, pending: 0, flagged: 0 });
  const [submissions, setSubmissions] = useState([]);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const dropdownRef = useRef(null);

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

  const loadData = async () => {
    const { session } = await getSession();
    if (!session) {
      navigate("/sign_in");
      return;
    }
    const { data: profile } = await getUserProfile(session.user.id);
    setUserName(profile?.full_name || "Teacher");
    const { data: pendingDocs } = await fetchTeacherSubmissions(
      session.user.id,
      {
        status: "submitted",
      },
    );
    const { data: gradedDocs } = await fetchTeacherSubmissions(
      session.user.id,
      {
        status: "graded",
      },
    );
    setStats({
      graded: gradedDocs?.length ?? 0,
      pending: pendingDocs?.length ?? 0,
      flagged: 0,
    });
    const rows = await Promise.all(
      (pendingDocs ?? []).map(async (doc) => {
        const { data: student } = await getUserProfile(doc.user_id);
        return {
          id: doc.id,
          studentName: student?.full_name ?? "Student",
          title: doc.title,
          score: "—",
          status: formatDocumentStatus(doc.status),
        };
      }),
    );
    setSubmissions(rows);
    const { data: tasks } = await fetchTeacherAssignmentTasks(session.user.id);
    setTeacherTasks(tasks ?? []);
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUploadEssays = async () => {
    const title = window.prompt("New assignment title:");
    if (!title) return;
    const instruction = window.prompt("Instructions:") || "";
    const { session } = await getSession();
    const { error } = await createAssignmentTask({
      title,
      instruction,
      created_by: session?.user?.id ?? null,
      status: "active",
    });
    if (error) alert(error.message);
    else {
      alert("Assignment created.");
      loadData();
    }
  };

  const handleUploadRubric = async () => {
    const { data: tasks } = await listAssignmentTasks();
    if (!tasks?.length) {
      alert("Create an assignment first before uploading a rubric.");
      return;
    }
    const taskList = tasks.map((t) => `${t.id}: ${t.title}`).join("\n");
    const taskId = window.prompt(`Assignment task ID:\n${taskList}`);
    const name = window.prompt("Rubric name:");
    if (!taskId || !name) return;
    const { error } = await createRubricWithValidation({
      assignment_task_id: Number(taskId),
      name,
      description: "",
    });
    if (error) alert(error.message);
    else alert("Rubric created.");
  };

  const handleEditTask = async (task) => {
    const title = window.prompt("Task title:", task.title);
    if (!title) return;
    const instruction =
      window.prompt("Instructions:", task.instruction || "") ?? "";
    const { error } = await updateAssignmentTask(task.id, {
      title,
      instruction,
    });
    if (error) alert(error.message);
    else loadData();
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    const { error } = await deleteAssignmentTask(task.id);
    if (error) alert(error.message);
    else loadData();
  };

  const handleExportGrades = () => {
    if (!submissions.length) return;
    const csv = [
      ["Student", "Essay", "Status", "Score"].join(","),
      ...submissions.map((s) =>
        [s.studentName, s.title, s.status, s.score].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#c5ecff] pt-6 pr-6 font-sans overflow-hidden box-border gap-0">
      <AppPageHeader showSearch={false} />

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex flex-1 w-full gap-8 overflow-hidden">
        {/* LEFT SIDEBAR PANEL */}
        <div className="w-[400px] bg-[#7ba4cc] h-full flex flex-col justify-between py-8 pl-4 relative shadow-[5px_0_15px_rgba(0,0,0,0.05)] rounded-tr-2xl">
          <div className="flex flex-col w-full">
            <SidebarNav
              items={sidebarItems}
              activeTab={activeTab}
              onNavigate={handleNavigation}
            />
          </div>

          <SidebarProfileRow />
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto box-border pr-2 pb-6">
          <div>
            <h1 className="text-page-title">Welcome back, {userName}!</h1>
            <p className="text-xs text-[#475569] tracking-wide">
              Here's what's happening with your tasks.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1e293b]">
                Your assignments
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleUploadEssays}
                  className="bg-white text-slate-800 font-medium py-2.5 px-6 border border-[#cbd5e1] rounded-xl shadow-sm cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  Upload New Essays
                </button>
                <button
                  onClick={handleUploadRubric}
                  className="bg-white text-slate-800 font-medium py-2.5 px-6 border border-[#cbd5e1] rounded-xl shadow-sm cursor-pointer text-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  Upload Rubric
                </button>
              </div>
            </div>
            {teacherTasks.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No tasks yet. Create one above.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {teacherTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-[#cbd5e1] rounded-xl p-4 shadow-sm min-w-[200px] max-w-xs flex-1"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800">
                        {task.title}
                      </p>
                      <div
                        className="relative"
                        ref={activeMenuId === task.id ? dropdownRef : null}
                      >
                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === task.id ? null : task.id,
                            )
                          }
                          className="flex items-center gap-1 bg-[#7ba4cc]/20 hover:bg-[#7ba4cc]/40 px-2 py-1.5 rounded-md border border-[#7ba4cc]/30 transition-all cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 bg-[#7ba4cc] rounded-full inline-block"></span>
                          <span className="w-2.5 h-2.5 bg-[#cbd5e1] rounded-full inline-block"></span>
                        </button>

                        {activeMenuId === task.id && (
                          <div className="absolute right-0 top-full mt-1 z-30 w-32 bg-[#7ba4cc] border border-[#6993bc] rounded-lg shadow-lg overflow-hidden flex flex-col transform origin-top-right transition-all duration-100">
                            <button
                              onClick={() => {
                                handleEditTask(task);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#1e293b] font-medium hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteTask(task);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#1e293b] font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {task.instruction || "No instructions"}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2">
                  {stats.graded}
                </span>
              </div>
              <div className="bg-white border border-[#cbd5e1] rounded-xl p-5 shadow-sm h-28 flex flex-col justify-start">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider text-center w-full">
                  Pending
                </span>
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2">
                  {stats.pending}
                </span>
              </div>
              <div className="bg-white border border-[#cbd5e1] rounded-xl p-5 shadow-sm h-28 flex flex-col justify-start">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider text-center w-full">
                  Flagged for Review
                </span>
                <span className="text-3xl font-bold text-center text-[#1e293b] mt-2">
                  {stats.flagged}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-[250px]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1e293b] tracking-wide">
                Student Submission List
              </h2>
              <button
                onClick={handleExportGrades}
                disabled={!submissions.length}
                className="bg-white text-slate-800 font-medium py-1.5 px-4 border border-[#cbd5e1] rounded-lg shadow-sm cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
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
                  {submissions.length === 0 ? (
                    <tr className="flex w-full border-b border-slate-50 text-slate-400 text-sm italic items-center justify-center h-32">
                      <td>No active student submissions loaded yet.</td>
                    </tr>
                  ) : (
                    submissions.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() =>
                          navigate("/teacher_grade_essay", {
                            state: { essayId: row.id },
                          })
                        }
                        className="flex w-full border-b border-slate-50 text-slate-700 text-sm items-center py-3 px-6 cursor-pointer hover:bg-slate-50"
                      >
                        <td className="flex-1">{row.studentName}</td>
                        <td className="w-32 text-center">{row.score}</td>
                        <td className="w-48 text-center capitalize">
                          {row.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
