import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Icon */}
          <div className="bg-error/10 p-6 rounded-full mb-4">
            <ShieldAlert className="w-16 h-16 text-error" />
          </div>

          {/* Title */}
          <h2 className="card-title text-3xl font-bold text-error mb-2">
            Access Denied
          </h2>

          {/* Message */}
          <p className="text-base-content/70 mb-6">
            You don't have permission to access this page. This area is
            restricted to administrators only.
          </p>

          {/* Actions */}
          <div className="card-actions flex-col w-full gap-2">
            <Link to="/" className="btn btn-primary w-full">
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <button onClick={logout} className="btn btn-outline w-full">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Additional Info */}
          <div className="alert alert-warning mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm">
              If you believe this is an error, please contact your system
              administrator.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
