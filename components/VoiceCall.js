"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Vapi from "@vapi-ai/web";
import {
  VAPI_ASSISTANT_ID,
  VAPI_PUBLIC_KEY,
  VAPI_ASSISTANT_OVERRIDES,
} from "@/lib/config";

export default function VoiceCall({ open, onClose }) {
  // Status states: 'idle' | 'connecting' | 'live' | 'error'
  const [status, setStatus] = useState("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState(""); // 'missing-key' | 'mic-denied' | 'generic'
  const [transcripts, setTranscripts] = useState([]);

  // Hardware / Audio state
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [localMicLevel, setLocalMicLevel] = useState(0);

  // Debug state: strictly only enabled when ?debug=1 is in the URL
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const vapiRef = useRef(null);
  const lastRemoteVolLog = useRef(0);
  const lastLocalVolLog = useRef(0);

  // Local Web Audio Analyser references
  const localAudioCtxRef = useRef(null);
  const localAnalyserRef = useRef(null);
  const localStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Log only when debugMode is active
  const logEvent = useCallback(
    (event, data) => {
      if (!debugMode) return;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[VAPI] ${event}:`, data);
      setDebugLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          time: timestamp,
          event,
          data: typeof data === "object" ? JSON.stringify(data, null, 2) : String(data),
        },
        ...prev.slice(0, 49),
      ]);
    },
    [debugMode]
  );

  // Check URL for ?debug=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search || "";
      const isDebug =
        search.includes("debug=1") ||
        new URLSearchParams(search).get("debug") === "1";
      setDebugMode(isDebug);
    }
  }, []);

  // Local Audio Analyser for live meter (used when debug mode is enabled or for audio monitoring)
  const startLocalAudioMeter = useCallback(async (deviceId) => {
    try {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (localAudioCtxRef.current) {
        try {
          await localAudioCtxRef.current.close();
        } catch (e) {}
      }

      const constraints = {
        audio: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      localAudioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      localAnalyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        if (!localAnalyserRef.current) return;
        localAnalyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(100, Math.round((avg / 100) * 100));
        setLocalMicLevel(normalized);
        animFrameRef.current = requestAnimationFrame(loop);
      };

      loop();
    } catch (err) {
      // Non-critical background meter
    }
  }, []);

  const stopLocalAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localAudioCtxRef.current) {
      try {
        localAudioCtxRef.current.close();
      } catch (e) {}
      localAudioCtxRef.current = null;
    }
    localAnalyserRef.current = null;
    setLocalMicLevel(0);
  }, []);

  // Enumerate input devices (only in debug mode)
  const enumerateMics = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      setAudioDevices(audioInputs);
      setSelectedDeviceId((prev) => {
        if (!prev && audioInputs.length > 0) {
          return audioInputs[0].deviceId;
        }
        return prev;
      });
    } catch (err) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (open && debugMode) {
      enumerateMics();
    }
  }, [open, debugMode, enumerateMics]);

  // Teardown call
  const cleanupCall = useCallback(async () => {
    stopLocalAudioMeter();
    if (vapiRef.current) {
      try {
        await vapiRef.current.stop();
      } catch (err) {
        console.error("Error stopping Vapi call:", err);
      }
      vapiRef.current = null;
    }
    setStatus("idle");
    setIsSpeaking(false);
    setVolume(0);
    setIsMuted(false);
  }, [stopLocalAudioMeter]);

  // Tab hidden / Page closed cleanup (visibilitychange, pagehide, beforeunload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cleanupCall();
      }
    };

    const handlePageHide = () => {
      cleanupCall();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      cleanupCall();
    };
  }, [cleanupCall]);

  useEffect(() => {
    if (!open) {
      cleanupCall();
      setErrorMessage("");
      setErrorType("");
      setTranscripts([]);
    }
  }, [open, cleanupCall]);

  const handleModalClose = useCallback(async () => {
    await cleanupCall();
    onClose();
  }, [cleanupCall, onClose]);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleModalClose]);

  // Start call - triggered directly from user gesture for iOS Safari compliance
  const startCall = async () => {
    setErrorMessage("");
    setErrorType("");

    // Missing key check with friendly production text
    if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY === "your_vapi_public_key_here") {
      setStatus("error");
      setErrorType("missing-key");
      setErrorMessage("Voice assistant is not configured yet.");
      return;
    }

    try {
      setStatus("connecting");

      // Instantiate Vapi directly within user tap gesture
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      // Event handlers
      vapi.on("call-start", () => {
        logEvent("call-start", { status: "live" });
        setStatus("live");

        // Ensure call is unmuted
        vapi.setMuted(false);
        const realMuted = vapi.isMuted();
        setIsMuted(realMuted);

        if (debugMode) {
          startLocalAudioMeter(selectedDeviceId);
        }
      });

      vapi.on("call-end", () => {
        logEvent("call-end", {});
        setStatus("idle");
        setIsSpeaking(false);
        setVolume(0);
        setIsMuted(false);
        stopLocalAudioMeter();
        vapiRef.current = null;
      });

      vapi.on("speech-start", () => {
        logEvent("speech-start", {});
        setIsSpeaking(true);
      });

      vapi.on("speech-end", () => {
        logEvent("speech-end", {});
        setIsSpeaking(false);
      });

      vapi.on("volume-level", (vol) => {
        const v = typeof vol === "number" ? vol : 0;
        setVolume(v);
        const now = Date.now();
        if (now - lastRemoteVolLog.current >= 1000) {
          lastRemoteVolLog.current = now;
          logEvent("volume-level", { remoteVolume: v.toFixed(3) });
        }
      });

      vapi.on("local-volume-level", (lvl) => {
        const now = Date.now();
        if (now - lastLocalVolLog.current >= 1000) {
          lastLocalVolLog.current = now;
          logEvent("local-volume-level", { localLevel: (lvl || 0).toFixed(3) });
        }
      });

      // Stream user and assistant transcripts (partial + final)
      vapi.on("message", (msg) => {
        if (!msg) return;

        logEvent("message", {
          type: msg.type,
          transcriptType: msg.transcriptType,
          role: msg.role,
          transcript: msg.transcript || msg.text || msg.message,
        });

        if (msg.type === "transcript") {
          const role = msg.role;
          const text = (
            msg.transcript ||
            msg.text ||
            msg.message ||
            ""
          ).trim();
          const isPartial = msg.transcriptType === "partial";

          if (text && (role === "user" || role === "assistant")) {
            setTranscripts((prev) => {
              const lastIdx = prev.length - 1;
              const last = prev[lastIdx];

              if (last && last.role === role && last.isPartial) {
                const updated = [...prev];
                updated[lastIdx] = {
                  ...last,
                  text,
                  isPartial,
                  time: Date.now(),
                };
                return updated.slice(-8);
              }

              return [
                ...prev,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  role,
                  text,
                  isPartial,
                  time: Date.now(),
                },
              ].slice(-8);
            });
          }
        }
      });

      vapi.on("error", (err) => {
        logEvent("error", err);

        const errStr = String(
          err?.message ||
            err?.error?.message ||
            JSON.stringify(err) ||
            ""
        );

        if (/NotAllowedError|permission|microphone|denied|device/i.test(errStr)) {
          setErrorType("mic-denied");
          setErrorMessage("Microphone permission was denied.");
        } else {
          setErrorType("generic");
          setErrorMessage(
            "Could not connect to the voice assistant. Please check your connection and try again."
          );
        }

        setStatus("error");
        setIsSpeaking(false);
        setVolume(0);
        stopLocalAudioMeter();
      });

      // Set input device if previously selected
      if (selectedDeviceId) {
        try {
          await vapi.setInputDevicesAsync({ audioDeviceId: selectedDeviceId });
        } catch (e) {}
      }

      // Launch call directly from the user click
      if (VAPI_ASSISTANT_OVERRIDES) {
        await vapi.start(VAPI_ASSISTANT_ID, VAPI_ASSISTANT_OVERRIDES);
      } else {
        await vapi.start(VAPI_ASSISTANT_ID);
      }
    } catch (err) {
      logEvent("start-call-exception", err);
      const errStr = String(err?.message || err);

      if (/NotAllowedError|permission|microphone|denied/i.test(errStr)) {
        setErrorType("mic-denied");
        setErrorMessage("Microphone permission was denied.");
      } else {
        setErrorType("generic");
        setErrorMessage(
          "Could not start voice call. Please tap the orb to try again."
        );
      }

      setStatus("error");
      setIsSpeaking(false);
      setVolume(0);
      stopLocalAudioMeter();
      vapiRef.current = null;
    }
  };

  const handleOrbClick = () => {
    if (status === "connecting" || status === "live") {
      cleanupCall();
    } else {
      startCall();
    }
  };

  const toggleMute = () => {
    if (vapiRef.current && status === "live") {
      const nextMuted = !isMuted;
      try {
        vapiRef.current.setMuted(nextMuted);
        setIsMuted(vapiRef.current.isMuted());
      } catch (err) {
        console.error("Mute toggle failed:", err);
      }
    }
  };

  const handleDeviceChange = async (e) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);

    if (vapiRef.current && status === "live") {
      try {
        await vapiRef.current.setInputDevicesAsync({ audioDeviceId: newId });
      } catch (err) {}
    }

    if (status === "live" && debugMode) {
      startLocalAudioMeter(newId);
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting to the kitchen...";
      case "live":
        return isSpeaking ? "Assistant is speaking" : "Listening to you";
      case "error":
        return "Call could not start";
      case "idle":
      default:
        return "Tap the orb to start";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="AI Voice Assistant"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-x-hidden overflow-y-auto bg-ink/95 backdrop-blur-xl pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-king/20 text-2xl">
                👑
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl text-white truncate">
                  Pizza King Voice AI
                </h2>
                <p className="text-[11px] sm:text-xs text-white/50 truncate">
                  Urdu &amp; English Order Assistant (24/7)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              aria-label="Close voice assistant modal"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-xl text-white/70 transition hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
            >
              ✕
            </button>
          </div>

          {/* Headphone Advice Hint */}
          <div className="mt-2 shrink-0 text-center px-1">
            <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/70 border border-white/10 text-left sm:text-center">
              <span>🎧</span>
              <span className="truncate">
                <strong>Tip:</strong> Wear headphones to prevent audio feedback.
              </span>
            </p>
          </div>

          {/* Interactive Stage */}
          <div className="my-auto flex flex-col items-center justify-center py-2 text-center">
            {/* Glowing Orb Button */}
            <div className="relative flex items-center justify-center">
              {status === "live" && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-40 w-40 rounded-full bg-king/30 animate-ripple sm:h-52 sm:w-52"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-40 w-40 rounded-full bg-king/30 animate-ripple sm:h-52 sm:w-52"
                    style={{ animationDelay: "0.8s" }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-40 w-40 rounded-full bg-cheese/25 animate-ripple sm:h-52 sm:w-52"
                    style={{ animationDelay: "1.6s" }}
                  />
                </>
              )}

              <motion.button
                type="button"
                onClick={handleOrbClick}
                aria-label={
                  status === "live" || status === "connecting"
                    ? "End voice call"
                    : "Start voice call with assistant"
                }
                animate={{
                  scale:
                    status === "live"
                      ? 1 + Math.min(volume, 1) * 0.35
                      : status === "connecting"
                      ? [1, 1.05, 1]
                      : 1,
                }}
                transition={
                  status === "connecting"
                    ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    : { type: "spring", stiffness: 320, damping: 22 }
                }
                className={`relative z-10 flex min-h-[44px] min-w-[44px] h-32 w-32 xs:h-36 xs:w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-cheese ${
                  status === "live"
                    ? "bg-gradient-to-tr from-king via-ember to-cheese shadow-[0_0_60px_rgba(255,71,87,0.85)]"
                    : status === "connecting"
                    ? "bg-gradient-to-tr from-cheese via-ember to-king shadow-[0_0_40px_rgba(255,165,2,0.6)]"
                    : "bg-gradient-to-tr from-king to-ember shadow-[0_0_35px_rgba(255,71,87,0.5)] active:scale-95"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1 select-none">
                  <span className="text-3xl xs:text-4xl sm:text-5xl">
                    {status === "live"
                      ? isSpeaking
                        ? "🗣️"
                        : "🎙️"
                      : status === "connecting"
                      ? "⏳"
                      : "🍕"}
                  </span>
                  <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-white">
                    {status === "live" || status === "connecting"
                      ? "Tap to End"
                      : "Tap to Talk"}
                  </span>
                </div>
              </motion.button>
            </div>

            {/* Plain text status */}
            <p className="mt-4 font-display text-lg sm:text-2xl text-white">
              {getStatusText()}
            </p>

            <p className="mt-0.5 text-xs text-white/60 max-w-xs">
              {status === "live"
                ? "Speak normally in Urdu or English."
                : status === "connecting"
                ? "Connecting directly to kitchen AI..."
                : status === "idle"
                ? "Order fresh pizza through live voice."
                : "Tap the orb to try again."}
            </p>

            {/* Live Meter (Only visible in debug mode) */}
            {debugMode && status === "live" && (
              <div className="mt-2 flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    localMicLevel > 8
                      ? "bg-green-400 animate-ping"
                      : "bg-white/30"
                  }`}
                />
                <span className="text-[11px] text-green-400 font-bold">
                  {localMicLevel > 8 ? "You are being heard" : "Mic listening..."}
                </span>
                <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all duration-75"
                    style={{ width: `${Math.min(localMicLevel * 1.5, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Mute Button (min 44px touch target) */}
            {status === "live" && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                className={`mt-3 flex min-h-[44px] items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese ${
                  isMuted
                    ? "bg-king text-white shadow-glow"
                    : "bg-white/10 text-white hover:bg-white/20 active:bg-white/30"
                }`}
              >
                <span>{isMuted ? "🔇" : "🎙️"}</span>
                <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
              </button>
            )}

            {/* Device selector (Only visible in debug mode) */}
            {debugMode && audioDevices.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 border border-white/10 text-xs">
                <label
                  htmlFor="mic-select"
                  className="text-white/50 text-[11px]"
                >
                  🎤 Mic:
                </label>
                <select
                  id="mic-select"
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="rounded bg-ink px-2 py-1 text-white text-xs outline-none focus:ring-1 focus:ring-cheese max-w-[180px] truncate min-h-[32px]"
                >
                  {audioDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Message & Guided Resolution Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 w-full max-w-sm rounded-2xl border border-king/40 bg-king/10 p-3.5 text-left text-xs text-white"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">⚠️</span>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm">
                      {errorMessage}
                    </p>

                    {errorType === "missing-key" && (
                      <p className="mt-1 text-white/70">
                        Please check with the site administrator or set{" "}
                        <code className="text-cheese font-mono text-[11px]">
                          NEXT_PUBLIC_VAPI_PUBLIC_KEY
                        </code>{" "}
                        in Vercel project settings.
                      </p>
                    )}

                    {errorType === "mic-denied" && (
                      <div className="mt-2 space-y-1.5 text-[11px] text-white/80">
                        <p className="font-semibold text-cheese">
                          How to enable microphone:
                        </p>
                        <p>
                          <strong>iPhone (Safari):</strong> Tap{" "}
                          <span className="font-mono font-bold">aA</span> in the
                          address bar → <em>Website Settings</em> →{" "}
                          <em>Microphone</em> → select <strong>Allow</strong>.
                        </p>
                        <p>
                          <strong>Android (Chrome):</strong> Tap the lock/tune
                          icon beside the URL → <em>Permissions</em> → turn{" "}
                          <strong>Microphone On</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Transcript Box */}
          <div className="shrink-0 w-full max-w-2xl mx-auto mb-1">
            <div className="rounded-2xl border border-white/10 bg-panel/80 p-3 sm:p-4 backdrop-blur-md">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/40">
                <span className="font-semibold uppercase tracking-wider">
                  Live Conversation
                </span>
                <span>{status === "live" ? "🔴 Live" : "⚪ Ready"}</span>
              </div>

              {transcripts.length === 0 ? (
                <p className="py-2.5 text-center text-xs text-white/40">
                  {status === "live"
                    ? 'Start speaking (e.g. "Mujhe do large fajita pizza chahiye")...'
                    : "Tap the orb above to talk live in Urdu or English."}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-32 xs:max-h-36 sm:max-h-44 overflow-y-auto pr-1">
                  {transcripts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col rounded-xl px-3 py-1.5 text-xs ${
                        item.role === "user"
                          ? "ml-auto max-w-[85%] bg-king text-white"
                          : "mr-auto max-w-[85%] bg-white/10 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-cheese uppercase">
                          {item.role === "user" ? "You" : "Pizza King AI"}
                        </span>
                        {item.isPartial && (
                          <span className="text-[9px] text-white/60 italic animate-pulse">
                            speaking...
                          </span>
                        )}
                      </div>
                      <span
                        className={`leading-snug ${
                          item.isPartial ? "text-white/90 italic" : "text-white"
                        }`}
                      >
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Debug Console Drawer (Strictly ?debug=1 in URL) */}
          {debugMode && (
            <div className="shrink-0 mx-auto w-full max-w-2xl rounded-xl border border-cheese/30 bg-black/90 p-2.5 font-mono text-[11px] text-green-400">
              <div className="flex items-center justify-between pb-1 border-b border-white/10 text-white/60">
                <span className="font-bold text-cheese">
                  🛠️ Debug Console ({debugLogs.length} events)
                </span>
                <button
                  type="button"
                  onClick={() => setDebugLogs([])}
                  className="text-white/40 hover:text-white text-[10px]"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 mt-1">
                {debugLogs.length === 0 ? (
                  <p className="text-white/40">No events logged yet.</p>
                ) : (
                  debugLogs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 pb-0.5">
                      <div className="flex gap-2 text-white/50 text-[9px]">
                        <span>[{log.time}]</span>
                        <span className="font-bold text-cheese">{log.event}</span>
                      </div>
                      <pre className="text-[10px] text-green-300 whitespace-pre-wrap break-all">
                        {log.data}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
