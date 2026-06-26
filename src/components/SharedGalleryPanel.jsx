import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Heart, ImagePlus, Search, Trash2, X } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { createId } from "../services/storageService";
import { fileToDataUrl, formatDateTime, isCarePairItem } from "../utils/featureUtils";
import { EmptyState, Field, PrimaryButton, SectionCard, SecondaryButton } from "./ui";

export default function SharedGalleryPanel({ user, caregiverId, receiverId }) {
  const [images, setImages] = useStoredCollection(STORAGE_KEYS.galleryImages);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const pairImages = useMemo(() => {
    const filtered = images
      .filter((item) => isCarePairItem(item, caregiverId, receiverId))
      .filter((item) => {
        const text = `${item.caption || ""} ${item.fileName || ""}`.toLowerCase();
        return text.includes(query.trim().toLowerCase());
      });
    return filtered.sort((a, b) => {
      if (sort === "favorites") return Number(b.favorite) - Number(a.favorite);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [caregiverId, images, query, receiverId, sort]);

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const nextImages = await Promise.all(
      files
        .filter((file) => file.type.startsWith("image/"))
        .map(async (file) => ({
          id: createId(),
          caregiverId,
          receiverId,
          ownerId: user.id,
          caption: caption.trim(),
          fileName: file.name,
          dataUrl: await fileToDataUrl(file),
          favorite: false,
          createdAt: new Date().toISOString(),
        })),
    );
    setImages((items) => [...items, ...nextImages]);
    setCaption("");
    setUploading(false);
    event.target.value = "";
  };

  const toggleFavorite = (id) => {
    setImages((items) =>
      items.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  };

  const deleteImage = (id) => {
    setImages((items) =>
      items.filter((item) => !(item.id === id && item.ownerId === user.id)),
    );
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Shared gallery"
        subtitle="Photos for the two of you, saved locally and shaped for future cloud sync."
        action={
          <SecondaryButton onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} />
            Upload
          </SecondaryButton>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_150px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search shared photos"
              placeholder="Search photos..."
              className="w-full rounded-2xl border border-pink-100 bg-white px-11 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
            />
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort shared photos"
            className="rounded-2xl border border-pink-100 bg-white px-4 py-3 font-semibold text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="favorites">Favorites</option>
          </select>
          <PrimaryButton onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Camera size={16} />
            {uploading ? "Adding" : "Add photos"}
          </PrimaryButton>
        </div>
        <Field
          label="Caption for next upload"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength="120"
          placeholder="A tiny note for these photos"
          className="mt-4"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Upload shared photos"
          onChange={uploadImages}
          className="hidden"
        />
      </SectionCard>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {pairImages.map((image) => (
            <motion.article
              layout
              key={image.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group overflow-hidden rounded-[var(--care-radius-lg)] border border-pink-100 bg-white/85 shadow-lg shadow-pink-900/6"
            >
              <button
                type="button"
                onClick={() => setSelected(image)}
                className="block aspect-[4/3] w-full overflow-hidden bg-pink-50"
              >
                <img
                  src={image.dataUrl}
                  alt={image.caption || image.fileName || "Shared gallery"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </button>
              <div className="p-4">
                <p className="truncate font-semibold text-slate-900">
                  {image.caption || image.fileName || "Shared photo"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(image.createdAt)}</p>
                <div className="mt-3 flex justify-between gap-2">
                  <SecondaryButton onClick={() => toggleFavorite(image.id)} size="sm">
                    <Heart size={15} fill={image.favorite ? "currentColor" : "none"} />
                    {image.favorite ? "Saved" : "Favorite"}
                  </SecondaryButton>
                  {image.ownerId === user.id && (
                    <SecondaryButton
                      onClick={() => deleteImage(image.id)}
                      size="sm"
                      className="border-red-100 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </SecondaryButton>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {!pairImages.length && (
        <EmptyState icon={Camera} title="No shared photos yet">
          Upload the first photo for this care circle.
        </EmptyState>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image viewer"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-700"
              aria-label="Close viewer"
            >
              <X size={18} />
            </button>
            <img
              src={selected.dataUrl}
              alt={selected.caption || selected.fileName || "Shared gallery"}
              className="max-h-[82vh] max-w-full rounded-[var(--care-radius-lg)] object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
