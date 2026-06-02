import { useEffect, useRef, useCallback } from "react";
import { getSession, saveDocument } from "../services/api.js";

/**
 * Auto-saves document draft after debounceMs of inactivity.
 * @param {{ title: string, content: string, documentId?: string|null, role: string, assignmentTaskId?: number|null }} doc
 * @param {{ debounceMs?: number, enabled?: boolean, onStatus?: (status: 'saving'|'saved'|'error', msg?: string) => void }} options
 */
export function useDebouncedDocumentSave(doc, options = {}) {
  const { debounceMs = 2000, enabled = true, onStatus } = options;
  const { title, content, role, assignmentTaskId } = doc;

  const documentIdRef = useRef(doc.documentId);
  const lastSavedRef = useRef({ title: title ?? "", content: content ?? "" });
  const timerRef = useRef(null);
  const savingRef = useRef(false);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    documentIdRef.current = doc.documentId;
  }, [doc.documentId]);

  const persist = useCallback(async () => {
    if (savingRef.current) return documentIdRef.current;

    const { session } = await getSession();
    if (!session) return documentIdRef.current;

    const t = title?.trim() ?? "";
    const c = content ?? "";
    if (!t && !c) return documentIdRef.current;

    savingRef.current = true;
    onStatusRef.current?.("saving");

    const { data, error } = await saveDocument({
      userId: session.user.id,
      role,
      title: t || "Untitled Draft",
      content: c,
      documentId: documentIdRef.current,
      assignmentTaskId,
    });

    savingRef.current = false;

    if (error) {
      onStatusRef.current?.("error", error.message || "Failed to save draft.");
      return documentIdRef.current;
    }

    if (data?.id) documentIdRef.current = data.id;
    lastSavedRef.current = { title: t, content: c };
    onStatusRef.current?.("saved");
    return documentIdRef.current;
  }, [title, content, role, assignmentTaskId]);

  useEffect(() => {
    if (!enabled) return;

    const t = title?.trim() ?? "";
    const c = content ?? "";
    if (t === lastSavedRef.current.title && c === lastSavedRef.current.content) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persist();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content, enabled, debounceMs, persist]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return persist();
  }, [persist]);

  return { saveNow, getDocumentId: () => documentIdRef.current };
}
