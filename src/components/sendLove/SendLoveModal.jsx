import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Camera,
  Heart,
  Mic,
  Send,
  Square,
  VolumeX,
  WandSparkles,
  X,
} from "lucide-react";
import { Button, PrimaryButton, SecondaryButton } from "../ui";
import {
  aiLoveSuggestions,
  createLoveMessage,
  loveCards,
  quickTemplates,
} from "./loveFeature";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function Waveform({ active = false }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <motion.span
          key={index}
          animate={{
            height: active ? [8, 28 + (index % 5) * 4, 10] : 10 + (index % 4) * 4,
            opacity: active ? [0.45, 1, 0.55] : 0.55,
          }}
          transition={{
            duration: 1.15,
            repeat: active ? Infinity : 0,
            delay: index * 0.025,
            ease: "easeInOut",
          }}
          className="w-1 rounded-full bg-pink-400"
        />
      ))}
    </div>
  );
}

export default function SendLoveModal({
  open,
  onClose,
  onSend,
  caregiverId,
  receiverId,
  receiverName,
}) {
  const [message, setMessage] = useState(quickTemplates[0]);
  const [selectedCard, setSelectedCard] = useState(loveCards[0]);
  const [photo, setPhoto] = useState(null);
  const [voice, setVoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const discardRecordingRef = useRef(false);
  const audioContextRef = useRef(null);
  const fileRef = useRef(null);

  const stopMediaStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const resetDraft = () => {
    setSoundEnabled(false);
    setMessage(quickTemplates[0]);
    setSelectedCard(loveCards[0]);
    setPhoto(null);
    setVoice(null);
    setRecordError("");
  };

  const closeModal = () => {
    if (recorderRef.current?.state === "recording") {
      discardRecordingRef.current = true;
      recorderRef.current.stop();
    } else {
      stopMediaStream();
    }
    setRecording(false);
    resetDraft();
    onClose();
  };

  const playSoftChime = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(783.99, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.34);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => gain.disconnect();
    oscillator.start();
    oscillator.stop(context.currentTime + 0.36);
  };

  const toggleSound = () => {
    if (!soundEnabled) playSoftChime();
    setSoundEnabled((enabled) => !enabled);
  };

  useEffect(() => {
    if (!open) return undefined;
    return () => {
      if (recorderRef.current?.state === "recording") {
        discardRecordingRef.current = true;
        recorderRef.current.stop();
      } else {
        stopMediaStream();
      }
      audioContextRef.current?.close?.();
      audioContextRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const startRecording = async () => {
    setRecordError("");
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
          setVoice({ dataUrl, type: blob.type, createdAt: new Date().toISOString() });
        }
        discardRecordingRef.current = false;
        stopMediaStream();
      };
      recorder.start();
      setRecording(true);
    } catch {
      setRecordError("Microphone access was not available.");
    }
  };

  const stopRecording = () => {
    discardRecordingRef.current = false;
    recorderRef.current?.stop();
    setRecording(false);
  };

  const attachPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPhoto({ dataUrl, name: file.name });
  };

  const submit = (event) => {
    event.preventDefault();
    const loveMessage = createLoveMessage({
      caregiverId,
      receiverId,
      message,
      card: selectedCard,
      voice,
      photo,
    });
    onSend(loveMessage);
    if (soundEnabled) playSoftChime();
    closeModal();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-md"
        role="presentation"
      >
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Send Love"
          className="premium-card scrollbar-soft max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[var(--care-radius-lg)] p-5 shadow-2xl shadow-pink-950/15 sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
                Send Love
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Create a moment for {receiverName || "your loved one"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose a message, voice note, photo, or animated card.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={toggleSound}
                aria-label={soundEnabled ? "Mute Send Love sounds" : "Enable Send Love sound"}
                aria-pressed={soundEnabled}
                className="h-10 w-10 px-0"
              >
                {soundEnabled ? <Bell size={17} /> : <VolumeX size={17} />}
              </Button>
              <Button
                type="button"
                onClick={closeModal}
                variant="ghost"
                size="sm"
                aria-label="Close Send Love"
                className="h-10 w-10 px-0"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_0.92fr]">
            <div className="space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Quick templates</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickTemplates.map((template) => (
                    <button
                      type="button"
                      key={template}
                      onClick={() => setMessage(template)}
                      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                        message === template
                          ? "border-pink-400 bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                          : "border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </section>

              <label className="block text-sm font-semibold text-slate-700">
                Short message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows="4"
                  maxLength="220"
                  className="mt-2 w-full rounded-[1.35rem] border border-pink-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
                  placeholder="Write something gentle..."
                  required
                />
              </label>

              <section>
                <div className="flex items-center gap-2">
                  <WandSparkles size={17} className="text-pink-500" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    AI love suggestions
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {aiLoveSuggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => setMessage(suggestion)}
                      className="rounded-full border border-pink-100 bg-pink-50/70 px-3.5 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[var(--care-radius)] border border-pink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Voice love
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Record a short voice note they can replay and save.
                    </p>
                  </div>
                  {recording ? (
                    <SecondaryButton type="button" onClick={stopRecording}>
                      <Square size={16} />
                      Stop
                    </SecondaryButton>
                  ) : (
                    <SecondaryButton type="button" onClick={startRecording}>
                      <Mic size={16} />
                      Record
                    </SecondaryButton>
                  )}
                </div>
                <Waveform active={recording} />
                {recordError && (
                  <p className="text-sm font-semibold text-red-600">{recordError}</p>
                )}
                {voice && (
                  <div className="mt-3 rounded-[var(--care-radius)] bg-pink-50 p-3">
                    <audio controls src={voice.dataUrl} className="w-full" />
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Animated card</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {loveCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCard(card)}
                      className={`overflow-hidden rounded-[var(--care-radius)] border p-0 text-left transition ${
                        selectedCard.id === card.id
                          ? "border-pink-400 ring-4 ring-pink-200/55"
                          : "border-pink-100 hover:-translate-y-0.5"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.005 }}
                        className={`bg-gradient-to-br ${card.gradient} p-4 text-white`}
                      >
                        <Heart size={20} fill="currentColor" aria-hidden="true" />
                        <p className="mt-5 text-lg font-semibold tracking-tight">
                          {card.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/80">
                          {card.caption}
                        </p>
                      </motion.div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[var(--care-radius)] border border-pink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Photo message
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Attach a photo with a soft card overlay.
                    </p>
                  </div>
                  <SecondaryButton
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera size={16} />
                    Photo
                  </SecondaryButton>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    aria-label="Attach photo to Send Love"
                    onChange={attachPhoto}
                    className="hidden"
                  />
                </div>
                {photo ? (
                  <div className="relative mt-4 overflow-hidden rounded-[var(--care-radius)] bg-slate-950/5">
                    <img
                      src={photo.dataUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50 blur-2xl"
                    />
                    <img
                      src={photo.dataUrl}
                      alt="Attached love message"
                      className="relative z-10 max-h-72 w-full object-contain"
                    />
                    <div className="absolute inset-x-3 bottom-3 z-20 rounded-[var(--care-radius)] bg-white/84 px-4 py-3 text-sm font-semibold text-slate-800 backdrop-blur">
                      {message}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid min-h-36 place-items-center rounded-[var(--care-radius)] border border-dashed border-pink-200 bg-pink-50/50 text-sm font-semibold text-pink-700">
                    No photo attached
                  </div>
                )}
              </section>

              <div className="flex flex-wrap justify-end gap-2">
                <SecondaryButton type="button" onClick={closeModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  <Send size={17} />
                  Send Love
                </PrimaryButton>
              </div>
            </div>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export { Waveform };
