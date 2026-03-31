"use client";

import { useState, useEffect } from "react";

export function useSettings() {
  const [muteMessages, setMuteMessages] = useState(false);
  const [silentMode, setSilentMode] = useState(false);

  useEffect(() => {
    const savedMuteMessages = localStorage.getItem("muteMessages") === "true";
    const savedSilentMode = localStorage.getItem("silentMode") === "true";

    setMuteMessages(savedMuteMessages);
    setSilentMode(savedSilentMode);
  }, []);

  const toggleMuteMessages = () => {
    const newValue = !muteMessages;
    setMuteMessages(newValue);
    localStorage.setItem("muteMessages", String(newValue));
  };

  const toggleSilentMode = () => {
    const newValue = !silentMode;
    setSilentMode(newValue);
    localStorage.setItem("silentMode", String(newValue));
  };

  return {
    muteMessages,
    toggleMuteMessages,
    silentMode,
    toggleSilentMode,
  };
}
