import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider.");
  return context;
}
