import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApp from "../hooks/useApp";
import { Field, PrimaryButton, SecondaryButton, SectionCard } from "./ui";

export default function SettingsPanel({ user }) {
  const navigate = useNavigate();
  const {
    setUser,
    settings,
    updateSettings,
    firebase,
    firebaseConfigured,
  } = useApp();
  const [profile, setProfile] = useState({
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage || "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const updateUsers = (updatedUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    localStorage.setItem(
      "users",
      JSON.stringify(
        users.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
      ),
    );
    setUser(updatedUser);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    if (!profile.fullName.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) {
      setMessage("Enter a valid name and email address.");
      return;
    }
    updateUsers({ ...user, ...profile });
    setMessage("Profile updated.");
  };

  const changePassword = (event) => {
    event.preventDefault();
    if (passwords.current !== user.password) {
      setMessage("Current password is incorrect.");
      return;
    }
    if (passwords.next.length < 6 || passwords.next !== passwords.confirm) {
      setMessage("New passwords must match and contain at least 6 characters.");
      return;
    }
    updateUsers({ ...user, password: passwords.next });
    setPasswords({ current: "", next: "", confirm: "" });
    setMessage("Password changed.");
  };

  const loadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      setMessage("Choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((current) => ({ ...current, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const deleteAccount = () => {
    const confirmation = window.prompt(
      'Type DELETE to permanently remove this local account.',
    );
    if (confirmation !== "DELETE") return;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    localStorage.setItem(
      "users",
      JSON.stringify(
        users
          .filter((item) => item.id !== user.id)
          .map((item) =>
            item.connectedUserId === user.id
              ? { ...item, connectedUserId: null }
              : item,
          ),
      ),
    );
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Profile" subtitle="Your personal space inside the care circle.">
        <form onSubmit={saveProfile} className="grid gap-5 md:grid-cols-[170px_1fr]">
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid h-36 w-36 place-items-center overflow-hidden rounded-[var(--care-radius-lg)] bg-pink-100 text-4xl font-semibold text-pink-700 shadow-xl shadow-pink-500/15 ring-4 ring-white transition hover:scale-[1.01]"
              aria-label="Choose profile image"
            >
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user.fullName.slice(0, 1).toUpperCase()
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={loadImage}
              className="hidden"
            />
            <p className="mt-3 text-xs text-slate-500">Max 1.5 MB</p>
          </div>
          <div className="space-y-4">
            <Field
              label="Full name"
              value={profile.fullName}
              onChange={(event) =>
                setProfile({ ...profile, fullName: event.target.value })
              }
              required
            />
            <Field
              label="Email"
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile({ ...profile, email: event.target.value })
              }
              required
            />
            <PrimaryButton type="submit">Save profile</PrimaryButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Appearance" subtitle="Choose the theme that feels easiest to read.">
        <div className="flex gap-3">
          {["light", "dark"].map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ ...settings, theme })}
              aria-pressed={settings.theme === theme}
              className={`rounded-2xl px-5 py-3 font-bold capitalize transition ${
                settings.theme === theme
                  ? "bg-pink-600 text-white"
                  : "border border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
              }`}
            >
              {theme} mode
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Notification preferences"
        subtitle="Choose which local reminders appear in your notification center."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["medicine", "Medicine reminders"],
            ["meal", "Meal reminders"],
            ["water", "Water reminders"],
            ["appointment", "Appointment reminders"],
          ].map(([key, label]) => {
            const enabled = settings.notifications?.[key] !== false;
            return (
              <label
                key={key}
                className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-pink-100 bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-sm shadow-pink-900/5"
              >
                {label}
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) =>
                    updateSettings({
                      ...settings,
                      notifications: {
                        ...(settings.notifications || {}),
                        [key]: event.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 accent-pink-600"
                />
              </label>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Privacy settings"
        subtitle="Control privacy preferences for this local device."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["hideSensitiveVitals", "Hide sensitive vitals in shared views"],
            ["requireDeleteConfirm", "Require typed confirmation before account deletion"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-pink-100 bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-sm shadow-pink-900/5"
            >
              {label}
              <input
                type="checkbox"
                checked={Boolean(settings.privacy?.[key])}
                onChange={(event) =>
                  updateSettings({
                    ...settings,
                    privacy: {
                      ...(settings.privacy || {}),
                      [key]: event.target.checked,
                    },
                  })
                }
                className="h-5 w-5 accent-pink-600"
              />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Cloud sync"
        subtitle="Local storage remains active while Firebase migration is introduced collection by collection."
      >
        <span
          className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
            firebase
              ? "bg-emerald-100 text-emerald-700"
              : "bg-pink-50 text-pink-700"
          }`}
        >
          {firebase
            ? "Firebase connected"
            : firebaseConfigured
              ? "Firebase connecting"
              : "Local offline mode"}
        </span>
      </SectionCard>

      <SectionCard title="Change password">
        <form onSubmit={changePassword} className="grid gap-4 md:grid-cols-3">
          <Field
            label="Current password"
            type="password"
            value={passwords.current}
            onChange={(event) =>
              setPasswords({ ...passwords, current: event.target.value })
            }
            required
          />
          <Field
            label="New password"
            type="password"
            minLength="6"
            value={passwords.next}
            onChange={(event) =>
              setPasswords({ ...passwords, next: event.target.value })
            }
            required
          />
          <Field
            label="Confirm password"
            type="password"
            minLength="6"
            value={passwords.confirm}
            onChange={(event) =>
              setPasswords({ ...passwords, confirm: event.target.value })
            }
            required
          />
          <PrimaryButton type="submit" className="md:col-span-3 md:w-fit">
            Change password
          </PrimaryButton>
        </form>
      </SectionCard>

      {message && (
        <p role="status" className="rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm font-semibold text-pink-800">
          {message}
        </p>
      )}

      <SectionCard title="Delete account" subtitle="This removes the account from this device.">
        <SecondaryButton
          onClick={deleteAccount}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Delete my account
        </SecondaryButton>
      </SectionCard>
    </div>
  );
}
