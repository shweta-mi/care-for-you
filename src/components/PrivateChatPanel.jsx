import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Mic, Search, Send, Square } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { createId } from "../services/storageService";
import { fileToDataUrl, formatDateTime, isCarePairItem } from "../utils/featureUtils";
import { EmptyState, PrimaryButton, SectionCard, SecondaryButton } from "./ui";

export default function PrivateChatPanel({ user, caregiverId, receiverId }) {
  const [messages, setMessages] = useStoredCollection(STORAGE_KEYS.privateChatMessages);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingVoice, setPendingVoice] = useState(null);
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

  const pairMessages = useMemo(
    () =>
      messages
        .filter((item) => isCarePairItem(item, caregiverId, receiverId))
        .filter((item) => (item.text || "").toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [caregiverId, messages, query, receiverId],
  );

  const sendMessage = (event) => {
    event.preventDefault();
    if (!text.trim() && !pendingImage && !pendingVoice) return;
    setMessages((items) => [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        senderId: user.id,
        text: text.trim(),
        image: pendingImage,
        voice: pendingVoice,
        readBy: [user.id],
        createdAt: new Date().toISOString(),
      },
    ]);
    setText("");
    setPendingImage(null);
    setPendingVoice(null);
  };

  const attachImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPendingImage({ dataUrl: await fileToDataUrl(file), name: file.name });
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
          setPendingVoice({ dataUrl, type: blob.type });
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

  const markVisibleAsRead = () => {
    setMessages((items) =>
      items.map((item) =>
        isCarePairItem(item, caregiverId, receiverId) && !item.readBy?.includes(user.id)
          ? { ...item, readBy: [...(item.readBy || []), user.id] }
          : item,
      ),
    );
  };

  return (
    <SectionCard
      title="Private chat"
      subtitle="A local-first conversation space with records ready for realtime sync."
      action={<SecondaryButton onClick={markVisibleAsRead}>Mark read</SecondaryButton>}
    >
      <label className="relative mb-4 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search chat history"
          placeholder="Search chat history..."
          className="w-full rounded-2xl border border-pink-100 bg-white px-11 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
        />
      </label>

      <div className="scrollbar-soft flex max-h-[58vh] min-h-80 flex-col gap-3 overflow-y-auto rounded-[1.5rem] border border-pink-100 bg-pink-50/35 p-4">
        {pairMessages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <article key={message.id} className={`max-w-[82%] ${mine ? "ml-auto" : ""}`}>
              <div className={`rounded-[1.35rem] px-4 py-3 shadow-sm ${mine ? "bg-pink-600 text-white shadow-pink-500/15" : "bg-white text-slate-700 shadow-pink-900/5"}`}>
                {message.text && <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>}
                {message.image?.dataUrl && <img src={message.image.dataUrl} alt="" loading="lazy" className="mt-3 max-h-64 rounded-2xl object-cover" />}
                {message.voice?.dataUrl && <audio controls src={message.voice.dataUrl} className="mt-3 w-full" />}
              </div>
              <p className={`mt-1 text-xs ${mine ? "text-right" : ""} text-slate-400`}>
                {formatDateTime(message.createdAt)} {mine ? `· ${message.readBy?.length > 1 ? "Read" : "Sent"}` : ""}
              </p>
            </article>
          );
        })}
        {!pairMessages.length && <EmptyState title="No messages yet">Start with a tiny check-in.</EmptyState>}
      </div>

      <p className="mt-3 text-xs font-semibold text-pink-700">Typing indicator ready for realtime sync.</p>

      {(pendingImage || pendingVoice) && (
        <div className="mt-3 rounded-2xl border border-pink-100 bg-white/80 p-3 text-sm font-semibold text-slate-600">
          {pendingImage ? "Image attached. " : ""}
          {pendingVoice ? "Voice message attached." : ""}
        </div>
      )}

      <form onSubmit={sendMessage} className="mt-4 flex flex-wrap gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Private message"
          placeholder="Write a private message..."
          className="min-w-0 flex-1 rounded-2xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
        />
        <input ref={fileRef} type="file" accept="image/*" aria-label="Attach chat image" onChange={attachImage} className="hidden" />
        <SecondaryButton type="button" onClick={() => fileRef.current?.click()} className="h-12 w-12 px-0" aria-label="Attach image">
          <ImagePlus size={17} />
        </SecondaryButton>
        {recording ? (
          <SecondaryButton type="button" onClick={stopRecording} className="h-12 w-12 px-0" aria-label="Stop recording">
            <Square size={17} />
          </SecondaryButton>
        ) : (
          <SecondaryButton type="button" onClick={startRecording} className="h-12 w-12 px-0" aria-label="Record voice message">
            <Mic size={17} />
          </SecondaryButton>
        )}
        <PrimaryButton type="submit" className="h-12 w-12 px-0" aria-label="Send message">
          <Send size={17} />
        </PrimaryButton>
      </form>
    </SectionCard>
  );
}
