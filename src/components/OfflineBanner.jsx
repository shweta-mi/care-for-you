import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-800">
      You are offline. Dashboard, medicines, reports, and saved local data remain available.
    </div>
  );
}
