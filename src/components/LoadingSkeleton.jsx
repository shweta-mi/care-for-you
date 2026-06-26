import Skeleton from "react-loading-skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading content" role="status">
      {[1, 2, 3].map((item) => (
        <div key={item} className="premium-card rounded-[1.5rem] p-6">
          <Skeleton width="36%" height={22} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Skeleton height={88} />
            <Skeleton height={88} />
            <Skeleton height={88} />
          </div>
          <div className="mt-5">
            <Skeleton height={14} width="82%" />
            <Skeleton height={14} width="64%" />
          </div>
        </div>
      ))}
    </div>
  );
}
