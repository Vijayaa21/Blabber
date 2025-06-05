const RightPanelSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-80 p-5 bg-base-200 rounded-xl shadow-md animate-pulse">
      <div className="flex gap-4 items-center">
        {/* Profile Picture Skeleton */}
        <div className="skeleton w-12 h-12 rounded-full" />

        {/* Text lines */}
        <div className="flex flex-col gap-2 w-full">
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton h-3 w-2/3 rounded-full" />
        </div>
      </div>

      {/* Button Placeholder */}
      <div className="skeleton h-8 w-32 rounded-full self-end mt-2" />
    </div>
  );
};

export default RightPanelSkeleton;
