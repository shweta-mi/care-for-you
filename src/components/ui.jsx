import { memo } from "react";
import { motion } from "framer-motion";
import { Inbox, X } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const buttonStyles = {
  primary:
    "bg-pink-500 text-white shadow-md shadow-pink-500/18 hover:bg-pink-600 active:bg-pink-700",
  secondary:
    "border border-pink-100 bg-white/90 text-slate-700 shadow-sm shadow-pink-900/5 hover:border-pink-200 hover:bg-pink-50/70",
  danger:
    "bg-rose-600 text-white shadow-md shadow-rose-600/18 hover:bg-rose-700",
  ghost: "text-slate-600 hover:bg-pink-50 hover:text-pink-700",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  const sizes = {
    sm: "min-h-9 px-3 text-sm",
    md: "min-h-10 px-4 text-sm",
    lg: "min-h-12 px-5 text-base",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ y: props.disabled ? 0 : -0.5 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--care-radius)] font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        buttonStyles[variant] || buttonStyles.primary,
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <Button {...props} className={className} variant="primary">
      {children}
    </Button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <Button {...props} className={className} variant="secondary">
      {children}
    </Button>
  );
}

export const SectionCard = memo(function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("premium-card rounded-[var(--care-radius-lg)] p-5 sm:p-6", className)}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
});

export function Field({ label, as = "input", children, className = "", ...props }) {
  const Component = as;
  const fieldId =
    props.id ||
    `field-${String(label || props.name || "input")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <label className={cn("block text-sm font-semibold text-slate-700", className)}>
      {label}
      <Component
        {...props}
        id={fieldId}
        className={cn(
          "mt-2 w-full rounded-[var(--care-radius)] border border-pink-100 bg-white/95 px-4 py-3 font-normal text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45 disabled:bg-pink-50/50",
          props.className,
        )}
      >
        {children}
      </Component>
    </label>
  );
}

export function EmptyState({
  title,
  children,
  icon: Icon = Inbox,
}) {
  const heading = title || (typeof children === "string" ? children : "Nothing here yet");
  const body = title || typeof children !== "string" ? children : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid min-h-36 place-items-center rounded-[var(--care-radius-lg)] border border-dashed border-pink-200 bg-pink-50/50 p-7 text-center"
    >
      <div>
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-pink-400 shadow-sm shadow-pink-900/10">
          <Icon size={18} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-700">{heading}</p>
        {body && <p className="mt-1 text-sm text-slate-500">{body}</p>}
      </div>
    </motion.div>
  );
}

export function ProgressBar({ value, color = "bg-pink-500" }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="h-3 overflow-hidden rounded-full bg-pink-50 shadow-inner" role="progressbar" aria-valuenow={safeValue} aria-valuemin="0" aria-valuemax="100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={cn("h-full rounded-full shadow-sm", color)}
      />
    </div>
  );
}

export const StatCard = memo(function StatCard({
  label,
  value,
  accent = "text-pink-700",
  className = "",
}) {
  return (
    <motion.div
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn("rounded-[var(--care-radius)] border border-pink-100 bg-white/75 p-4 shadow-sm shadow-pink-900/5", className)}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", accent)}>
        {value}
      </p>
    </motion.div>
  );
});

export function StatusBadge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Modal({ open, title, subtitle, onClose, children, label }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-md"
      role="presentation"
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label={label || title}
        className="premium-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--care-radius-lg)] p-5 shadow-2xl shadow-pink-950/15 sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            className="h-9 w-9 px-0"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}
