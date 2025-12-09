import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage = ({
  title = "Oops! Something went wrong",
  message,
  onRetry,
  fullScreen = false,
}: ErrorMessageProps) => {
  const content = (
    <div className="text-center">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-base-content/70 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        {content}
      </div>
    );
  }

  return <div className="py-16 px-4">{content}</div>;
};

export default ErrorMessage;
