import { useEffect, useState } from "react";

export default function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const install = async () => {
    if (!prompt) return false;
    await prompt.prompt();
    const result = await prompt.userChoice;
    setPrompt(null);
    return result.outcome === "accepted";
  };

  return { canInstall: Boolean(prompt), install };
}
