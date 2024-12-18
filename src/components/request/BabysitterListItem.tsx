import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface BabysitterListItemProps {
  id: string;
  requestId: string;
  name: string;
  status: string;
  deleted?: boolean;
  onAction?: (requestId: string, id: string, name: string, action: "confirm" | "cancel") => void;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "parent confirmed":
      return "bg-green-500 text-white";
    case "parent cancelled":
      return "bg-red-500 text-white";
    case "available":
      return "bg-emerald-400";
    case "declined":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "parent confirmed") {
    return <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
  }
  if (statusLower === "parent cancelled") {
    return <XCircle className="h-5 w-5 text-red-500 mr-2" />;
  }
  return null;
};

export const BabysitterListItem = ({
  id,
  requestId,
  name,
  status,
  deleted,
  onAction,
}: BabysitterListItemProps) => {
  const statusIcon = getStatusIcon(status);
  const isActionable = !["parent confirmed", "parent cancelled"].includes(status.toLowerCase()) && onAction;

  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        {isActionable && (
          <>
            <button
              onClick={() => onAction(requestId, id, name, "confirm")}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => onAction(requestId, id, name, "cancel")}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="flex items-center">
          {statusIcon}
          <span>
            {name}
            {deleted && (
              <span className="text-muted-foreground ml-1">(deleted)</span>
            )}
          </span>
        </div>
      </div>
      <Badge className={getStatusColor(status)}>
        {status}
      </Badge>
    </div>
  );
};