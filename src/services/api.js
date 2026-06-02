import supabase from "../lib/supabaseClient.js";

const DOCUMENTS_BUCKET = "documents";
const AVATARS_BUCKET = "avatars";

/** @deprecated use DOCUMENTS_BUCKET */
const STORAGE_BUCKET = DOCUMENTS_BUCKET;

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export function isRlsError(error) {
  if (!error) return false;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "42501" ||
    code === "PGRST301" ||
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("violates row-level security")
  );
}

export function logSupabaseError(error, context) {
  if (!error) return null;

  const payload = {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    likelyRls: isRlsError(error),
  };

  if (payload.likelyRls) {
    console.error(
      `[Supabase RLS] ${context} — Row Level Security may be blocking this operation. Run supabase/rls_policies.sql or check policies.`,
      payload
    );
  } else {
    console.error(`[Supabase] ${context}`, payload);
  }

  return error;
}

/**
 * @template T
 * @param {() => Promise<{ data: T | null; error: unknown }>} fn
 * @param {string} context
 */
async function safeQuery(fn, context) {
  try {
    const result = await fn();
    if (result.error) {
      logSupabaseError(result.error, context);
    }
    return result;
  } catch (err) {
    console.error(`[Supabase] ${context} — unexpected error`, err);
    return { data: null, error: err };
  }
}

function withErrorLogging(result, context) {
  if (result.error) logSupabaseError(result.error, context);
  return result;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function getSession() {
  try {
    const result = await supabase.auth.getSession();
    if (result.error) logSupabaseError(result.error, "auth.getSession");
    return { session: result.data?.session ?? null, error: result.error };
  } catch (error) {
    console.error("[Supabase] auth.getSession — unexpected error", error);
    return { session: null, error };
  }
}

export async function getCurrentUser() {
  try {
    const result = await supabase.auth.getUser();
    if (result.error) logSupabaseError(result.error, "auth.getCurrentUser");
    return { user: result.data?.user ?? null, error: result.error };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signInWithGoogle(redirectPath = "/role_selection") {
  const cleanOrigin = window.location.origin.replace(/\/$/, "");
  return safeQuery(
    async () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${cleanOrigin}${redirectPath}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      }),
    "auth.signInWithGoogle"
  );
}

export async function signInWithEmail(email, password) {
  return safeQuery(
    async () => supabase.auth.signInWithPassword({ email, password }),
    "auth.signInWithEmail"
  );
}

export async function signUpWithEmail(email, password, metadata = {}) {
  return safeQuery(
    async () =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      }),
    "auth.signUpWithEmail"
  );
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) logSupabaseError(error, "auth.signOut");
    return { error };
  } catch (error) {
    console.error("[Supabase] auth.signOut — unexpected error", error);
    return { error };
  }
}

/**
 * Upserts public.users after OAuth / email sign-in.
 * @param {import('@supabase/supabase-js').Session | null} session
 * @param {{ role?: string }} [options]
 */
export async function syncUserToDatabase(session, options = {}) {
  if (!session?.user?.id) {
    return { data: null, error: new Error("No session user to sync.") };
  }

  const { data: existing } = await getUserProfile(session.user.id);
  const role = options.role ?? existing?.role ?? "student";
  const fullName =
    options.fullName ??
    existing?.full_name ??
    session.user.user_metadata?.full_name ??
    session.user.email?.split("@")[0] ??
    "User";

  return safeQuery(
    async () =>
      supabase
        .from("users")
        .upsert(
          {
            id: session.user.id,
            full_name: fullName,
            role,
          },
          { onConflict: "id" }
        )
        .select()
        .single(),
    "users.syncUserToDatabase"
  );
}

/** @alias syncUserToDatabase */
export async function syncUser(session, options) {
  return syncUserToDatabase(session, options);
}

export async function updateUserRole(userId, role) {
  return safeQuery(
    async () =>
      supabase.from("users").update({ role }).eq("id", userId).select().single(),
    "users.updateUserRole"
  );
}

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export async function getUserProfile(userId) {
  return safeQuery(
    async () => supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    "users.getUserProfile"
  );
}

export const fetchUserProfile = getUserProfile;

export async function upsertUserProfile(profile) {
  return safeQuery(
    async () => supabase.from("users").upsert(profile).select().single(),
    "users.upsertUserProfile"
  );
}

export async function updateUserProfile(userId, updates) {
  return safeQuery(
    async () =>
      supabase.from("users").update(updates).eq("id", userId).select().single(),
    "users.updateUserProfile"
  );
}

export async function deleteUserProfile(userId) {
  return safeQuery(
    async () => supabase.from("users").delete().eq("id", userId),
    "users.deleteUserProfile"
  );
}

export async function listUsers() {
  return safeQuery(
    async () =>
      supabase.from("users").select("*").order("created_at", { ascending: false }),
    "users.listUsers"
  );
}

// ---------------------------------------------------------------------------
// assignment_tasks
// ---------------------------------------------------------------------------

export async function fetchAssignmentTasks() {
  return listAssignmentTasks();
}

export async function listAssignmentTasks() {
  return safeQuery(
    async () =>
      supabase
        .from("assignment_tasks")
        .select("*")
        .order("created_at", { ascending: false }),
    "assignment_tasks.list"
  );
}

export async function getAssignmentTaskById(id) {
  return safeQuery(
    async () =>
      supabase.from("assignment_tasks").select("*").eq("id", id).maybeSingle(),
    "assignment_tasks.getById"
  );
}

export async function createAssignmentTask(task) {
  return safeQuery(
    async () => supabase.from("assignment_tasks").insert(task).select().single(),
    "assignment_tasks.create"
  );
}

export async function updateAssignmentTask(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("assignment_tasks").update(updates).eq("id", id).select().single(),
    "assignment_tasks.update"
  );
}

export async function deleteAssignmentTask(id) {
  return safeQuery(
    async () => supabase.from("assignment_tasks").delete().eq("id", id),
    "assignment_tasks.delete"
  );
}

// ---------------------------------------------------------------------------
// classes
// ---------------------------------------------------------------------------

export async function listClasses(filters = {}) {
  return safeQuery(async () => {
    let query = supabase.from("classes").select("*");
    if (filters.teacherId) query = query.eq("teacher_id", filters.teacherId);
    return query.order("class_name", { ascending: true });
  }, "classes.list");
}

export async function getClassById(id) {
  return safeQuery(
    async () => supabase.from("classes").select("*").eq("id", id).maybeSingle(),
    "classes.getById"
  );
}

export async function createClass(classRow) {
  return safeQuery(
    async () => supabase.from("classes").insert(classRow).select().single(),
    "classes.create"
  );
}

export async function updateClass(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("classes").update(updates).eq("id", id).select().single(),
    "classes.update"
  );
}

export async function deleteClass(id) {
  return safeQuery(
    async () => supabase.from("classes").delete().eq("id", id),
    "classes.delete"
  );
}

// ---------------------------------------------------------------------------
// documents
// ---------------------------------------------------------------------------

/** Apply filters; treats excludeStatus 'trash' as "library" (includes null + draft rows). */
function applyDocumentQueryFilters(query, filters = {}) {
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.role) {
    query = query.or(`role.eq.${filters.role},role.is.null`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (filters.excludeStatus === "trash") {
    // SQL: NULL <> 'trash' is unknown — those rows were hidden before
    query = query.or("status.is.null,status.neq.trash");
  } else if (filters.excludeStatus) {
    query = query.neq("status", filters.excludeStatus);
  }
  if (filters.classId) query = query.eq("class_id", filters.classId);
  if (filters.assignmentTaskId) {
    query = query.eq("assignment_task_id", filters.assignmentTaskId);
  }
  return query;
}

/**
 * Main Documents page: drafts + other non-trash statuses for the current user.
 */
export async function fetchDocuments({ userId, role } = {}) {
  return listDocuments({ userId, role, excludeStatus: "trash" });
}

/**
 * Trash page: only rows with status = 'trash'.
 */
export async function fetchTrash({ userId, role } = {}) {
  return safeQuery(async () => {
    let query = supabase.from("documents").select("*").eq("status", "trash");
    query = applyDocumentQueryFilters(query, { userId, role });
    return query.order("created_at", { ascending: false });
  }, "documents.fetchTrash");
}

export async function getDocuments(filters = {}) {
  return listDocuments(filters);
}

export async function listDocuments(filters = {}) {
  return safeQuery(async () => {
    let query = supabase.from("documents").select("*");
    query = applyDocumentQueryFilters(query, filters);
    return query.order("created_at", { ascending: false });
  }, "documents.list");
}

/**
 * Search documents by title OR content (case-insensitive).
 */
export async function searchDocuments({ userId, role, query, excludeStatus = "trash" }) {
  const term = query?.trim();
  if (!term) {
    return listDocuments({ userId, role, excludeStatus });
  }

  const pattern = `%${term.replace(/[%_,]/g, "")}%`;

  return safeQuery(async () => {
    let q = supabase
      .from("documents")
      .select("*")
      .or(`title.ilike."${pattern}",content.ilike."${pattern}"`);

    q = applyDocumentQueryFilters(q, { userId, role, excludeStatus });

    return q.order("created_at", { ascending: false });
  }, "documents.searchDocuments");
}

export async function getDocumentById(id) {
  return safeQuery(
    async () => supabase.from("documents").select("*").eq("id", id).maybeSingle(),
    "documents.getById"
  );
}

export async function createDocument(document) {
  return safeQuery(
    async () => supabase.from("documents").insert(document).select().single(),
    "documents.create"
  );
}

export async function updateDocument(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("documents").update(updates).eq("id", id).select().single(),
    "documents.update"
  );
}

export async function deleteDocument(id) {
  return safeQuery(
    async () => supabase.from("documents").delete().eq("id", id),
    "documents.delete"
  );
}

export async function moveDocumentToTrash(id) {
  return updateDocument(id, { status: "trash" });
}

export async function restoreDocument(id) {
  return updateDocument(id, { status: "draft" });
}

export async function submitDocument(id) {
  return updateDocument(id, { status: "submitted" });
}

/** @alias saveDocumentDraft */
export async function saveDocument(docData) {
  return saveDocumentDraft(docData);
}

export async function saveDocumentDraft({ userId, role, title, content, documentId, assignmentTaskId, classId, languageId }) {
  const payload = {
    user_id: userId,
    role,
    title: title || "Untitled Draft",
    content: content ?? "",
    status: "draft",
    assignment_task_id: assignmentTaskId ?? null,
    class_id: classId ?? null,
    language_id: languageId ?? null,
  };

  if (documentId) {
    return updateDocument(documentId, {
      title: payload.title,
      content: payload.content,
      status: "draft",
      assignment_task_id: payload.assignment_task_id,
      class_id: payload.class_id,
      language_id: payload.language_id,
    });
  }

  return createDocument(payload);
}

export async function uploadDocumentFromFile(userId, role, file) {
  if (!file) {
    return { data: null, error: new Error("No file selected.") };
  }

  try {
    const textContent = await readFileAsText(file);
    const { data: uploadData, error: uploadError, path } = await uploadDocumentFile(userId, file);

    let content = textContent;
    if (uploadError && !textContent) {
      return { data: null, error: uploadError };
    }
    if (path && !textContent) {
      content = `[storage:${path}]`;
    }

    return createDocument({
      user_id: userId,
      role,
      title: file.name,
      content,
      status: "draft",
    });
  } catch (error) {
    console.error("[Supabase] documents.uploadDocumentFromFile", error);
    return { data: null, error };
  }
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const textTypes = /\.(txt|md|json|csv|html|css|js|jsx|ts|tsx)$/i;
    if (!textTypes.test(file.name)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

export function downloadDocumentContent(doc) {
  if (!doc?.content) {
    alert("No content available to download.");
    return;
  }
  const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${doc.title || "document"}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// evaluations
// ---------------------------------------------------------------------------

export async function listEvaluations(filters = {}) {
  return safeQuery(async () => {
    let query = supabase.from("evaluations").select("*");
    if (filters.essayId) query = query.eq("essay_id", filters.essayId);
    if (filters.evaluatorId) query = query.eq("evaluator_id", filters.evaluatorId);
    return query.order("evaluated_at", { ascending: false });
  }, "evaluations.list");
}

export async function getEvaluationById(id) {
  return safeQuery(
    async () => supabase.from("evaluations").select("*").eq("id", id).maybeSingle(),
    "evaluations.getById"
  );
}

export async function createEvaluation(evaluation) {
  return safeQuery(
    async () => supabase.from("evaluations").insert(evaluation).select().single(),
    "evaluations.create"
  );
}

export async function updateEvaluation(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("evaluations").update(updates).eq("id", id).select().single(),
    "evaluations.update"
  );
}

export async function deleteEvaluation(id) {
  return safeQuery(
    async () => supabase.from("evaluations").delete().eq("id", id),
    "evaluations.delete"
  );
}

/** Creates evaluation + optional feedback in one flow. */
export async function submitEvaluation({
  essayId,
  totalScore,
  suggestions,
  rubricMatrix,
  evaluatorId = null,
  strengths,
  weaknesses,
  feedbackSuggestions,
}) {
  try {
    const { data: evaluation, error: evalError } = await createEvaluation({
      essay_id: essayId,
      evaluator_id: evaluatorId,
      total_score: totalScore,
      evaluated_at: new Date().toISOString(),
      suggestions: suggestions ?? null,
      rubric_matrix: rubricMatrix ?? null,
    });

    if (evalError) return { data: null, error: evalError };

    if (strengths || weaknesses || feedbackSuggestions) {
      const { data: feedback, error: fbError } = await createFeedback({
        evaluation_id: evaluation.id,
        strengths: strengths ?? null,
        weaknesses: weaknesses ?? null,
        suggestions: feedbackSuggestions ?? suggestions ?? null,
      });

      if (fbError) return { data: { evaluation, feedback: null }, error: fbError };
      return { data: { evaluation, feedback }, error: null };
    }

    return { data: { evaluation, feedback: null }, error: null };
  } catch (error) {
    console.error("[Supabase] evaluations.submitEvaluation", error);
    return { data: null, error };
  }
}

export async function getStudentGradedEssays(userId) {
  return safeQuery(async () => {
    const { data: docs, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "student")
      .eq("status", "graded");

    if (docError) return { data: null, error: docError };

    const enriched = await Promise.all(
      (docs ?? []).map(async (doc) => {
        const { data: evals } = await supabase
          .from("evaluations")
          .select("*, feedback(*)")
          .eq("essay_id", doc.id)
          .order("evaluated_at", { ascending: false })
          .limit(1);

        const evaluation = evals?.[0];
        const feedbackRow = evaluation?.feedback?.[0] ?? evaluation?.feedback;

        return {
          id: doc.id,
          title: doc.title,
          subject: doc.class_id ? "Class assignment" : "Essay",
          score: evaluation?.total_score ?? "—",
          gradedDate: evaluation?.evaluated_at
            ? new Date(evaluation.evaluated_at).toLocaleDateString()
            : "—",
          submittedDate: doc.created_at
            ? new Date(doc.created_at).toLocaleString()
            : "—",
          wordCount: doc.content
            ? String(doc.content.trim().split(/\s+/).filter(Boolean).length)
            : "0",
          content: doc.content ?? "",
          feedback:
            feedbackRow?.suggestions ??
            evaluation?.suggestions ??
            "No feedback yet.",
          document: doc,
          evaluation,
        };
      })
    );

    return { data: enriched.filter((e) => e.evaluation), error: null };
  }, "evaluations.getStudentGradedEssays");
}

// ---------------------------------------------------------------------------
// feedback
// ---------------------------------------------------------------------------

export async function listFeedback(filters = {}) {
  return safeQuery(async () => {
    let query = supabase.from("feedback").select("*");
    if (filters.evaluationId) query = query.eq("evaluation_id", filters.evaluationId);
    return query.order("created_at", { ascending: false });
  }, "feedback.list");
}

export async function getFeedbackById(id) {
  return safeQuery(
    async () => supabase.from("feedback").select("*").eq("id", id).maybeSingle(),
    "feedback.getById"
  );
}

export async function createFeedback(feedback) {
  return safeQuery(
    async () => supabase.from("feedback").insert(feedback).select().single(),
    "feedback.create"
  );
}

export async function updateFeedback(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("feedback").update(updates).eq("id", id).select().single(),
    "feedback.update"
  );
}

export async function deleteFeedback(id) {
  return safeQuery(
    async () => supabase.from("feedback").delete().eq("id", id),
    "feedback.delete"
  );
}

// ---------------------------------------------------------------------------
// rubrics, criteria, languages, score_details
// ---------------------------------------------------------------------------

export async function listRubrics(filters = {}) {
  return safeQuery(async () => {
    let query = supabase.from("rubrics").select("*");
    if (filters.assignmentTaskId) {
      query = query.eq("assignment_task_id", filters.assignmentTaskId);
    }
    return query;
  }, "rubrics.list");
}

export async function getRubricById(id) {
  return safeQuery(
    async () => supabase.from("rubrics").select("*").eq("id", id).maybeSingle(),
    "rubrics.getById"
  );
}

export async function createRubric(rubric) {
  return safeQuery(
    async () => supabase.from("rubrics").insert(rubric).select().single(),
    "rubrics.create"
  );
}

export async function updateRubric(id, updates) {
  return safeQuery(
    async () => supabase.from("rubrics").update(updates).eq("id", id).select().single(),
    "rubrics.update"
  );
}

export async function deleteRubric(id) {
  return safeQuery(
    async () => supabase.from("rubrics").delete().eq("id", id),
    "rubrics.delete"
  );
}

export async function listCriteria(rubricId) {
  return safeQuery(
    async () => supabase.from("criteria").select("*").eq("rubric_id", rubricId),
    "criteria.list"
  );
}

export async function getCriteriaById(id) {
  return safeQuery(
    async () => supabase.from("criteria").select("*").eq("id", id).maybeSingle(),
    "criteria.getById"
  );
}

export async function createCriteria(criteria) {
  return safeQuery(
    async () => supabase.from("criteria").insert(criteria).select().single(),
    "criteria.create"
  );
}

export async function updateCriteria(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("criteria").update(updates).eq("id", id).select().single(),
    "criteria.update"
  );
}

export async function deleteCriteria(id) {
  return safeQuery(
    async () => supabase.from("criteria").delete().eq("id", id),
    "criteria.delete"
  );
}

export async function listLanguages() {
  return safeQuery(
    async () => supabase.from("languages").select("*").order("name", { ascending: true }),
    "languages.list"
  );
}

export async function createLanguage(language) {
  return safeQuery(
    async () => supabase.from("languages").insert(language).select().single(),
    "languages.create"
  );
}

export async function updateLanguage(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("languages").update(updates).eq("id", id).select().single(),
    "languages.update"
  );
}

export async function deleteLanguage(id) {
  return safeQuery(
    async () => supabase.from("languages").delete().eq("id", id),
    "languages.delete"
  );
}

export async function listScoreDetails(evaluationId) {
  return safeQuery(
    async () =>
      supabase.from("score_details").select("*").eq("evaluation_id", evaluationId),
    "score_details.list"
  );
}

export async function createScoreDetail(scoreDetail) {
  return safeQuery(
    async () => supabase.from("score_details").insert(scoreDetail).select().single(),
    "score_details.create"
  );
}

export async function updateScoreDetail(id, updates) {
  return safeQuery(
    async () =>
      supabase.from("score_details").update(updates).eq("id", id).select().single(),
    "score_details.update"
  );
}

export async function deleteScoreDetail(id) {
  return safeQuery(
    async () => supabase.from("score_details").delete().eq("id", id),
    "score_details.delete"
  );
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function isStorageBucketNotFound(error) {
  const message = (error?.message ?? "").toLowerCase();
  const status = error?.status ?? error?.statusCode;
  return message.includes("bucket not found") || status === 404 || status === "404";
}

function formatStorageError(error, bucket) {
  if (isStorageBucketNotFound(error)) {
    console.error(`Check Supabase Dashboard: Bucket ${bucket} must be created.`);
    return new Error(`Check Supabase Dashboard: Bucket "${bucket}" must be created.`);
  }
  return error;
}

export async function uploadDocumentFile(userId, file) {
  if (!file) return { data: null, error: new Error("No file provided."), path: null };

  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  try {
    const result = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (result.error) {
      const formatted = formatStorageError(result.error, DOCUMENTS_BUCKET);
      logSupabaseError(
        { code: result.error.name, message: formatted.message, details: null, hint: null },
        "storage.uploadDocumentFile"
      );
      return { data: null, error: formatted, path: null };
    }
    return { ...result, path };
  } catch (error) {
    console.error("[Supabase] storage.uploadDocumentFile", error);
    return { data: null, error, path: null };
  }
}

export async function downloadDocumentFile(filePath) {
  try {
    const result = await supabase.storage.from(DOCUMENTS_BUCKET).download(filePath);
    if (result.error) logSupabaseError(result.error, "storage.downloadDocumentFile");
    return result;
  } catch (error) {
    return { data: null, error };
  }
}

function sanitizeFileName(name) {
  return (name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Upload profile picture to avatars bucket and persist URL on users.avatar_url.
 */
export async function uploadProfilePic(userId, file) {
  if (!file || !userId) {
    return { data: null, url: null, error: new Error("User and file are required.") };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      const formatted = formatStorageError(uploadError, AVATARS_BUCKET);
      return { data: null, url: null, error: formatted };
    }

    const { data: publicData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    const url = publicData?.publicUrl
      ? `${publicData.publicUrl}?t=${Date.now()}`
      : null;

    if (url) {
      await updateUserProfile(userId, { avatar_url: url });
    }

    return { data: { path }, url, error: null };
  } catch (error) {
    console.error("[Supabase] storage.uploadProfilePic", error);
    return { data: null, url: null, error };
  }
}

export async function getProfileAvatarUrl(userId) {
  if (!userId) return { url: null, error: null };

  const { data: profile } = await getUserProfile(userId);
  if (profile?.avatar_url) {
    return { url: profile.avatar_url, error: null };
  }

  const { data: files, error } = await supabase.storage.from(AVATARS_BUCKET).list(userId, {
    limit: 1,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (error || !files?.length) {
    return { url: null, error };
  }

  const path = `${userId}/${files[0].name}`;
  const { data: publicData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const url = publicData?.publicUrl ?? null;
  return { url, error: null };
}

/**
 * Release grade to student: marks essay as graded (visible on student dashboard).
 */
export async function releaseScore(evaluationId) {
  try {
    const { data: evaluation, error: evalError } = await getEvaluationById(evaluationId);
    if (evalError) return { data: null, error: evalError };
    if (!evaluation?.essay_id) {
      return { data: null, error: new Error("Evaluation has no linked essay.") };
    }

    const { data: doc, error: docError } = await updateDocument(evaluation.essay_id, {
      status: "graded",
    });
    if (docError) return { data: null, error: docError };

    return { data: { evaluation, document: doc }, error: null };
  } catch (error) {
    console.error("[Supabase] releaseScore", error);
    return { data: null, error };
  }
}

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

export async function testSupabaseConnection() {
  const { session, error: sessionError } = await getSession();
  if (sessionError) {
    return { ok: false, message: "Auth session check failed.", details: sessionError };
  }

  const { data, error } = await listAssignmentTasks();
  if (error) {
    return {
      ok: false,
      message: isRlsError(error)
        ? "RLS blocked database read. Run supabase/rls_policies.sql."
        : "Database read failed.",
      details: error,
    };
  }

  return {
    ok: true,
    message: session
      ? `Connected as ${session.user.email}. ${data?.length ?? 0} assignment(s).`
      : `Connected. ${data?.length ?? 0} assignment(s).`,
    details: { rowCount: data?.length ?? 0 },
  };
}

export { supabase };
