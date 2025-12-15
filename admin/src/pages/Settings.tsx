import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Platform Settings
    navigate("/dashboard/platform/settings", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
};

export default Settings;
