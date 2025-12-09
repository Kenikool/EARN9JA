interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

const Loading = ({ size = "lg", fullScreen = false, text }: LoadingProps) => {
  const sizeClasses = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
        {text && <p className="mt-4 text-base-content/60">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
      {text && <p className="mt-4 text-base-content/60">{text}</p>}
    </div>
  );
};

export default Loading;
