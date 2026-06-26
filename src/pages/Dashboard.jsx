import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  Camera,
  Heart,
  Droplets,
  HeartPulse,
  HeartHandshake,
  LogOut,
  Menu,
  MessageCircle,
  Pill,
  PlusCircle,
  Settings,
  ShieldAlert,
  Sparkles,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import OfflineBanner from "../components/OfflineBanner";
import LoveReveal from "../components/sendLove/LoveReveal";
import SendLoveModal from "../components/sendLove/SendLoveModal";
import { unviewedForReceiver } from "../components/sendLove/loveFeature";
import { Button, PrimaryButton, SectionCard } from "../components/ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import useApp from "../hooks/useApp";
import useInstallPrompt from "../hooks/useInstallPrompt";
import { useStoredCollection } from "../hooks/useStoredCollection";
import useUnreadNotifications from "../hooks/useUnreadNotifications";

const panels = {
  medicines: lazy(() => import("../components/MedicinePanel")),
  meals: lazy(() => import("../components/MealPanel")),
  water: lazy(() => import("../components/WaterPanel")),
  appointments: lazy(() => import("../components/AppointmentPanel")),
  vitals: lazy(() => import("../components/VitalsPanel")),
  reports: lazy(() => import("../components/ReportsPanel")),
  gallery: lazy(() => import("../components/SharedGalleryPanel")),
  memories: lazy(() => import("../components/MemoriesPanel")),
  chat: lazy(() => import("../components/PrivateChatPanel")),
  mood: lazy(() => import("../components/MoodJournalPanel")),
  calendar: lazy(() => import("../components/CareCalendarPanel")),
  achievements: lazy(() => import("../components/AchievementsPanel")),
  notifications: lazy(() => import("../components/NotificationCenter")),
  emergency: lazy(() => import("../components/EmergencyPanel")),
  assistant: lazy(() => import("../components/HealthAssistantPanel")),
  personalization: lazy(() => import("../components/PersonalizationPanel")),
  settings: lazy(() => import("../components/SettingsPanel")),
};

const tabs = [
  { id: "medicines", label: "Medicines", icon: Pill },
  { id: "meals", label: "Meals", icon: Utensils },
  { id: "water", label: "Water", icon: Droplets },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "vitals", label: "Vitals", icon: HeartPulse },
  { id: "reports", label: "Reports", icon: Activity },
  { id: "gallery", label: "Gallery", icon: Camera },
  { id: "memories", label: "Memories", icon: Heart },
  { id: "chat", label: "Private Chat", icon: MessageCircle },
  { id: "mood", label: "Mood Journal", icon: Sparkles },
  { id: "calendar", label: "Care Calendar", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "emergency", label: "Emergency", icon: ShieldAlert },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "personalization", label: "Personalize", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const { canInstall, install } = useInstallPrompt();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tabs.some((item) => item.id === tab) ? tab : "medicines";
  });
  const [careCodeInput, setCareCodeInput] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sendLoveOpen, setSendLoveOpen] = useState(false);
  const [loveMessages, setLoveMessages] = useStoredCollection(STORAGE_KEYS.loveMessages);
  const [moodEntries] = useStoredCollection(STORAGE_KEYS.moodJournal);
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const connectedUser = users.find((item) => item.id === user?.connectedUserId);
  const caregiver =
    user.role === "caregiver"
      ? user
      : connectedUser?.role === "caregiver"
        ? connectedUser
        : null;
  const receiver =
    user.role === "receiver"
      ? user
      : connectedUser?.role === "receiver"
        ? connectedUser
        : null;
  const unreadCount = useUnreadNotifications(
    user,
    caregiver?.id,
    receiver?.id,
  );
  const nextLoveMessage =
    user.role === "receiver"
      ? unviewedForReceiver(loveMessages, user.id)[0]
      : null;
  const latestMood = moodEntries
    .filter((item) => item.receiverId === receiver?.id)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0];

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const handleConnect = (event) => {
    event.preventDefault();
    setConnectionError("");
    const foundUser = users.find(
      (item) => item.careCode === careCodeInput.trim().toUpperCase(),
    );
    if (!foundUser) return setConnectionError("That care code was not found.");
    if (foundUser.id === user.id)
      return setConnectionError("You cannot connect to your own account.");
    if (foundUser.role === user.role)
      return setConnectionError(
        "Please connect a caregiver with a care receiver.",
      );

    const updatedUsers = users.map((item) => {
      if (item.id === user.id) return { ...item, connectedUserId: foundUser.id };
      if (item.id === foundUser.id) return { ...item, connectedUserId: user.id };
      return item;
    });
    const updatedCurrentUser = { ...user, connectedUserId: foundUser.id };
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUser(updatedCurrentUser);
    window.location.reload();
  };

  const handleSendLove = (message) => {
    setLoveMessages((items) => [...items, message]);
  };

  const dismissLoveMessage = () => {
    if (!nextLoveMessage) return;
    setLoveMessages((items) =>
      items.map((item) =>
        item.id === nextLoveMessage.id ? { ...item, viewed: true } : item,
      ),
    );
  };

  const renderPanel = () => {
    const Panel = panels[activeTab] || panels.medicines;
    const props =
      activeTab === "settings"
        ? { user }
        : {
            user,
            caregiverId: caregiver?.id,
            receiverId: receiver?.id,
          };
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
        <Panel {...props} />
        </motion.div>
      </Suspense>
    );
  };

  const hasCarePair = connectedUser && caregiver && receiver;
  const showingSettings = activeTab === "settings";

  return (
    <div className="app-shell min-h-screen text-slate-800">
      <OfflineBanner />
      {hasCarePair && user.role === "caregiver" && (
        <SendLoveModal
          open={sendLoveOpen}
          onClose={() => setSendLoveOpen(false)}
          onSend={handleSendLove}
          caregiverId={caregiver?.id}
          receiverId={receiver?.id}
          receiverName={receiver?.fullName}
        />
      )}
      {nextLoveMessage && (
        <LoveReveal message={nextLoveMessage} onDismiss={dismissLoveMessage} />
      )}
      <header className="sticky top-0 z-20 border-b border-pink-100 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button
            onClick={() => setActiveTab("medicines")}
            className="flex items-center gap-3 text-left"
          >
            <span className="care-gradient grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg shadow-pink-500/25">
              <HeartHandshake size={21} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
                Care For Shweta
              </span>
              <span className="block text-lg font-semibold tracking-tight text-slate-950">
                Hello, {user.fullName.split(" ")[0]}
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {canInstall && (
              <Button
                onClick={install}
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <PlusCircle size={16} aria-hidden="true" />
                Install app
              </Button>
            )}
            {hasCarePair && user.role === "caregiver" && (
              <Button
                onClick={() => setSendLoveOpen(true)}
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Heart size={16} aria-hidden="true" />
                Send Love
              </Button>
            )}
            <Button
              onClick={() => setActiveTab("notifications")}
              variant="secondary"
              size="sm"
              className="relative h-10 w-10 px-0"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => setActiveTab("settings")}
              variant="secondary"
              size="sm"
              className="h-10 w-10 overflow-hidden px-0"
              aria-label="Profile and settings"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <Settings size={18} aria-hidden="true" />
              )}
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </Button>
            {hasCarePair && (
              <Button
                onClick={() => setMobileNavOpen((value) => !value)}
                variant="secondary"
                size="sm"
                className="h-10 w-10 px-0 lg:hidden"
                aria-label="Toggle dashboard navigation"
                aria-expanded={mobileNavOpen}
                >
                {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
                </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="care-gradient relative mb-6 overflow-hidden rounded-[var(--care-radius-lg)] p-6 text-white shadow-xl shadow-pink-500/18 sm:p-8"
        >
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white/90 backdrop-blur">
                <Sparkles size={15} aria-hidden="true" />
                {connectedUser
                  ? "Your care circle is connected"
                  : "Build your care circle"}
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {connectedUser
                  ? `${user.fullName} & ${connectedUser.fullName}`
                  : "Connect with someone you trust"}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                {user.role === "caregiver"
                  ? "A quiet, loving place to plan care, follow progress, and stay close when it matters."
                  : "A gentle daily companion for routines, check-ins, and keeping trusted help close."}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/20 bg-white/15 px-5 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Your care code
              </p>
              <p className="mt-1 text-xl font-semibold tracking-wider">
                {user.careCode}
              </p>
            </div>
          </div>
        </motion.section>

        {hasCarePair && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.04 }}
            className="mb-6 grid gap-4 md:grid-cols-3"
            aria-label="Today’s care overview"
          >
            {[
              ["Connected person", connectedUser.fullName, connectedUser.email],
              ["Your role", user.role === "caregiver" ? "Caregiver" : "Care receiver", "Shared care circle"],
              [
                "Latest mood",
                latestMood?.label || "Awaiting check-in",
                "Comfort, consistency, connection",
              ],
            ].map(([label, value, helper]) => (
              <div key={label} className="premium-card rounded-[1.5rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-700">
                  {label}
                </p>
                <p className="mt-2 truncate text-lg font-semibold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">{helper}</p>
              </div>
            ))}
          </motion.section>
        )}

        {!hasCarePair && !showingSettings ? (
          <div className="mx-auto max-w-xl">
            <SectionCard
              title="Connect your care partner"
              subtitle="Enter the care code from an account with the opposite role."
            >
              <form onSubmit={handleConnect} className="space-y-4">
                <input
                  type="text"
                  value={careCodeInput}
                  onChange={(event) => setCareCodeInput(event.target.value)}
                  aria-label="Care partner code"
                  placeholder="CFS-XXXXXX"
                  className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 uppercase shadow-sm shadow-pink-900/5 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
                  required
                />
                {connectionError && (
                  <p className="text-sm font-semibold text-red-600">
                    {connectionError}
                  </p>
                )}
                <PrimaryButton type="submit" className="w-full">
                  Connect care partner
                </PrimaryButton>
              </form>
            </SectionCard>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
            {hasCarePair && (
              <aside className={`${mobileNavOpen ? "block" : "hidden"} lg:sticky lg:top-24 lg:block lg:self-start`}>
                <div className="premium-card rounded-[1.5rem] p-3">
                  <div className="mb-3 rounded-[1.35rem] bg-pink-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-700">
                      Connected {connectedUser.role}
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {connectedUser.fullName}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {connectedUser.email}
                    </p>
                  </div>
                  <nav className="scrollbar-soft flex gap-2 overflow-x-auto lg:max-h-[62vh] lg:flex-col lg:overflow-y-auto" aria-label="Dashboard sections">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileNavOpen(false);
                        }}
                        className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          activeTab === tab.id
                            ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                            : "text-slate-600 hover:bg-pink-50 hover:text-pink-800"
                        }`}
                      >
                        <Icon size={18} aria-hidden="true" />
                        <span className="flex-1">{tab.label}</span>
                        {tab.id === "notifications" && unreadCount > 0 && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )})}
                  </nav>
                  {user.role === "caregiver" && (
                    <Button
                      onClick={() => setSendLoveOpen(true)}
                      className="mt-3 w-full"
                    >
                      <Heart size={16} fill="currentColor" />
                      Send Love
                    </Button>
                  )}
                </div>
              </aside>
            )}
            <div className={hasCarePair ? "" : "lg:col-span-2"}>
              {renderPanel()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
