interface SkeletonLoaderProps {
  type?: "card" | "list" | "text" | "avatar" | "image";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = "card", 
  count = 1,
  className = "" 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`card bg-base-100 border ${className}`}>
            <div className="skeleton h-48 w-full"></div>
            <div className="card-body">
              <div className="skeleton h-4 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2 mb-4"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        );
      
      case "list":
        return (
          <div className={`flex items-center gap-4 p-4 ${className}`}>
            <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-3 w-1/2"></div>
            </div>
          </div>
        );
      
      case "text":
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="skeleton h-4 w-4/6"></div>
          </div>
        );
      
      case "avatar":
        return <div className={`skeleton w-12 h-12 rounded-full ${className}`}></div>;
      
      case "image":
        return <div className={`skeleton w-full h-64 ${className}`}></div>;
      
      default:
        return <div className={`skeleton h-20 w-full ${className}`}></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
