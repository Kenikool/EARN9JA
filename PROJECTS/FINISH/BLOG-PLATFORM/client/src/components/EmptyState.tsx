import type { ReactNode } from "react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({
  icon = <FileText className="w-16 h-16" />,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-base-content/30 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && <p className="text-base-content/60 mb-6 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
