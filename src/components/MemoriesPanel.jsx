import { useEffect, useRef, useState } from "react";
import { Calendar, Heart, ImagePlus, Mic, Plus, Square, Trash2 } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { createId } from "../services/storageService";
import { toDateKey } from "../utils/dateUtils";
import { fileToDataUrl, formatShortDate, isCarePairItem } from "../utils/featureUtils";
import { EmptyState, Field, PrimaryButton, SectionCard, SecondaryButton } from "./ui";

export default function MemoriesPanel({ user, caregiverId, receiverId }) {
  const [memories, setMemories] = useStoredCollection(STORAGE_KEYS.sharedMemories);
  const [form, setForm] = useState({ text: "", date: toDateKey(), photo: null, voice: null });
  const [recording, setRecording] = useState(false);
  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const discardRecordingRef = useRef(false);

  const stopMediaStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        discardRecordingRef.current = true;
        recorderRef.current.stop();
      } else {
        stopMediaStream();
      }
    };
  }, []);

  const pairMemories = memories
    .filter((item) => isCarePairItem(item, caregiverId, receiverId))
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const attachPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((current) => ({
      ...current,
      photo: { dataUrl, name: file.name },
    }));
    event.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      discardRecordingRef.current = false;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const dataUrl = await fileToDataUrl(blob);
        if (!discardRecordingRef.current) {
          setForm((current) => ({
            ...current,
            voice: { dataUrl, type: blob.type },
          }));
        }
        discardRecordingRef.current = false;
        stopMediaStream();
      };
      recorder.start();
      setRecording(true);
    } catch {
      setRecording(false);
      stopMediaStream();
    }
  };

  const stopRecording = () => {
    discardRecordingRef.current = false;
    recorderRef.current?.stop();
    setRecording(false);
  };

  const saveMemory = (event) => {
    event.preventDefault();
    if (!form.text.trim() && !form.photo && !form.voice) return;
    setMemories((items) => [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        authorId: user.id,
        text: form.text.trim(),
        date: form.date,
        photo: form.photo,
        voice: form.voice,
        favorite: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setForm({ text: "", date: toDateKey(), photo: null, voice: null });
  };

  const toggleFavorite = (id) => {
    setMemories((items) =>
      items.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  };

  const deleteMemory = (id) => {
    setMemories((items) =>
      items.filter((item) => !(item.id === id && item.authorId === user.id)),
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Shared memories" subtitle="A gentle timeline of moments, notes, and voice keepsakes.">
        <form onSubmit={saveMemory} className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <Field
            label="Memory text"
            as="textarea"
            rows="4"
            value={form.text}
            onChange={(event) => setForm({ ...form, text: event.target.value })}
            placeholder="Write the small moment you want to keep..."
            maxLength="500"
          />
          <div className="space-y-3">
            <Field
              label="Date"
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <SecondaryButton type="button" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={16} />
                Photo
              </SecondaryButton>
              {recording ? (
                <SecondaryButton type="button" onClick={stopRecording}>
                  <Square size={16} />
                  Stop
                </SecondaryButton>
              ) : (
                <SecondaryButton type="button" onClick={startRecording}>
                  <Mic size={16} />
                  Voice
                </SecondaryButton>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" aria-label="Attach memory photo" onChange={attachPhoto} className="hidden" />
            <PrimaryButton type="submit" className="w-full">
              <Plus size={16} />
              Save memory
            </PrimaryButton>
          </div>
        </form>
        {(form.photo || form.voice) && (
          <p className="mt-3 text-sm font-semibold text-pink-700">
            {form.photo ? "Photo attached. " : ""}
            {form.voice ? "Voice note attached." : ""}
          </p>
        )}
      </SectionCard>

      <SectionCard title="Timeline" subtitle={`${pairMemories.length} saved moment${pairMemories.length === 1 ? "" : "s"}.`}>
        <div className="relative space-y-4 before:absolute before:left-5 before:top-2 before:h-full before:w-px before:bg-pink-100">
          {pairMemories.map((memory) => (
            <article key={memory.id} className="relative pl-14">
              <span className="absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-2xl bg-pink-100 text-pink-700 ring-8 ring-white">
                <Calendar size={17} />
              </span>
              <div className="rounded-[var(--care-radius-lg)] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-pink-700">{formatShortDate(memory.date)}</p>
                    {memory.text && <p className="mt-2 leading-7 text-slate-700">{memory.text}</p>}
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton size="sm" onClick={() => toggleFavorite(memory.id)} className="h-9 w-9 px-0" aria-label="Favorite memory">
                      <Heart size={15} fill={memory.favorite ? "currentColor" : "none"} />
                    </SecondaryButton>
                    {memory.authorId === user.id && (
                      <SecondaryButton size="sm" onClick={() => deleteMemory(memory.id)} className="h-9 w-9 border-red-100 px-0 text-red-600 hover:bg-red-50" aria-label="Delete memory">
                        <Trash2 size={15} />
                      </SecondaryButton>
                    )}
                  </div>
                </div>
                {memory.photo?.dataUrl && (
                  <img src={memory.photo.dataUrl} alt="" loading="lazy" className="mt-4 max-h-80 w-full rounded-2xl object-cover" />
                )}
                {memory.voice?.dataUrl && <audio controls src={memory.voice.dataUrl} className="mt-4 w-full" />}
              </div>
            </article>
          ))}
          {!pairMemories.length && <EmptyState title="No memories yet">Save a note, photo, or voice note to begin the timeline.</EmptyState>}
        </div>
      </SectionCard>
    </div>
  );
}
