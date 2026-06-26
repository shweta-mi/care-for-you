import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Heart, Pause, Play, RotateCcw, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../ui";
import { Waveform } from "./SendLoveModal";

function VoicePlayer({ voice }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  if (!voice?.dataUrl) return null;

  const play = () => {
    audioRef.current?.play();
    setPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const replay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  };

  return (
    <div className="rounded-[var(--care-radius)] border border-pink-100 bg-white/80 p-4 shadow-sm shadow-pink-900/5">
      <audio
        ref={audioRef}
        src={voice.dataUrl}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <Waveform active={playing} />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {playing ? (
          <SecondaryButton type="button" onClick={pause} aria-pressed={playing}>
            <Pause size={16} />
            Pause
          </SecondaryButton>
        ) : (
          <SecondaryButton type="button" onClick={play} aria-pressed={playing}>
            <Play size={16} />
            Play
          </SecondaryButton>
        )}
        <SecondaryButton type="button" onClick={replay}>
          <RotateCcw size={16} />
          Replay
        </SecondaryButton>
        <a
          href={voice.dataUrl}
          download="send-love-voice-note.webm"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--care-radius)] border border-pink-100 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-pink-900/5 transition hover:bg-pink-50"
        >
          <Download size={16} />
          Save
        </a>
      </div>
    </div>
  );
}

export default function LoveReveal({ message, onDismiss }) {
  const [revealState, setRevealState] = useState({
    messageId: message?.id,
    revealed: false,
  });
  const revealed =
    revealState.messageId === message?.id && revealState.revealed;

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(
      () => setRevealState({ messageId: message.id, revealed: true }),
      620,
    );
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-[#fff8fb] px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="New Send Love message"
        >
          <button
            onClick={onDismiss}
            className="fixed right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-pink-100 bg-white/90 text-slate-600 shadow-lg shadow-pink-900/10 backdrop-blur transition hover:bg-pink-50"
            aria-label="Close love message"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col items-center justify-center py-10 text-center">
            <motion.div
              initial={{ scale: 0.84, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative"
            >
              <div className="care-gradient relative grid h-20 w-20 place-items-center rounded-[var(--care-radius-lg)] text-white shadow-xl shadow-pink-500/20 sm:h-24 sm:w-24">
                <Heart size={38} fill="currentColor" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-pink-700"
            >
              New love arrived
            </motion.p>

            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.h1
                  key="waiting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl"
                >
                  Take a quiet moment
                </motion.h1>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-6 w-full"
                >
                  <div
                    className={`overflow-hidden rounded-[var(--care-radius-lg)] bg-gradient-to-br ${message.card?.gradient || "from-pink-500 via-rose-400 to-fuchsia-500"} p-6 text-white shadow-xl shadow-pink-500/18 sm:p-7`}
                  >
                    <Heart className="mx-auto" size={28} fill="currentColor" />
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                      {message.card?.title || "Thinking of You"}
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/82">
                      {message.card?.caption || "A quiet reminder that you are deeply loved."}
                    </p>
                  </div>

                  <div className="premium-card mt-5 rounded-[var(--care-radius-lg)] p-5 sm:p-6">
                    <p className="text-xl font-semibold leading-snug tracking-tight text-slate-950 sm:text-3xl">
                      {message.message}
                    </p>

                    {message.photo?.dataUrl && (
                      <div className="relative mt-5 overflow-hidden rounded-[var(--care-radius)] bg-slate-950/5">
                        <img
                          src={message.photo.dataUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50 blur-2xl"
                        />
                        <img
                          src={message.photo.dataUrl}
                          alt="Photo sent with love"
                          className="relative z-10 max-h-[420px] w-full object-contain"
                        />
                      </div>
                    )}

                    {message.voice?.dataUrl && (
                      <div className="mt-5">
                        <VoicePlayer voice={message.voice} />
                      </div>
                    )}

                    <div className="mt-6 flex justify-center">
                      <PrimaryButton type="button" onClick={onDismiss}>
                        Keep this close
                      </PrimaryButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
