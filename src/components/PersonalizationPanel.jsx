import useApp from "../hooks/useApp";
import { Field, SectionCard } from "./ui";

const accents = [
  ["Pink", "#ec4899"],
  ["Rose", "#f43f5e"],
  ["Coral", "#fb7185"],
  ["Berry", "#be185d"],
  ["Teal", "#0f766e"],
  ["Violet", "#8b5cf6"],
];

const themes = ["soft", "classic", "cozy", "bright"];
const backgrounds = ["blush", "linen", "petal", "clear"];
const cardStyles = ["glass", "solid", "outlined"];

export default function PersonalizationPanel() {
  const { settings, updateSettings } = useApp();
  const personalization = {
    accentColor: "#ec4899",
    themeStyle: "soft",
    galleryBackground: "blush",
    cardStyle: "glass",
    borderRadius: 24,
    fontSize: 16,
    animationIntensity: 70,
    theme: settings.theme || "light",
    animationsEnabled: true,
    ...(settings.personalization || {}),
  };

  const save = (next) =>
    updateSettings({
      ...settings,
      theme: next.theme || settings.theme || "light",
      personalization: { ...personalization, ...next },
    });

  return (
    <div className="space-y-6">
      <SectionCard title="Personalization center" subtitle="Make the care space feel familiar, soft, and easy to read.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">Accent color</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {accents.map(([label, color]) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => save({ accentColor: color })}
                  aria-label={label}
                  aria-pressed={personalization.accentColor === color}
                  className={`h-11 w-11 rounded-2xl border-4 transition ${personalization.accentColor === color ? "border-slate-900" : "border-white"}`}
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Dark / light mode</p>
            <div className="mt-3 flex gap-2">
              {["light", "dark"].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => save({ theme })}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold capitalize transition ${
                    personalization.theme === theme
                      ? "bg-pink-600 text-white"
                      : "border border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Theme"
            as="select"
            value={personalization.themeStyle}
            onChange={(event) => save({ themeStyle: event.target.value })}
          >
            {themes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
          </Field>

          <Field
            label="Gallery background"
            as="select"
            value={personalization.galleryBackground}
            onChange={(event) => save({ galleryBackground: event.target.value })}
          >
            {backgrounds.map((background) => <option key={background} value={background}>{background}</option>)}
          </Field>

          <Field
            label="Card style"
            as="select"
            value={personalization.cardStyle}
            onChange={(event) => save({ cardStyle: event.target.value })}
          >
            {cardStyles.map((style) => <option key={style} value={style}>{style}</option>)}
          </Field>

          <label className="block text-sm font-semibold text-slate-700">
            Border radius
            <input
              type="range"
              min="8"
              max="32"
              value={personalization.borderRadius}
              onChange={(event) => save({ borderRadius: Number(event.target.value) })}
              className="mt-3 w-full accent-pink-600"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Font size
            <input
              type="range"
              min="14"
              max="18"
              value={personalization.fontSize}
              onChange={(event) => save({ fontSize: Number(event.target.value) })}
              className="mt-3 w-full accent-pink-600"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Animation intensity
            <input
              type="range"
              min="0"
              max="100"
              value={personalization.animationIntensity}
              onChange={(event) => save({ animationIntensity: Number(event.target.value) })}
              className="mt-3 w-full accent-pink-600"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-[var(--care-radius-lg)] border border-pink-100 bg-white/80 p-4 text-sm font-semibold text-slate-700">
            Enable animations
            <input
              type="checkbox"
              checked={personalization.animationsEnabled !== false}
              onChange={(event) => save({ animationsEnabled: event.target.checked })}
              className="h-5 w-5 accent-pink-600"
            />
          </label>
        </div>
      </SectionCard>
    </div>
  );
}
