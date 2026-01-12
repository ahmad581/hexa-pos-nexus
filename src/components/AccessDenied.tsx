import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function AccessDenied({
  title = "Access denied",
  description = "You don’t have permission to view this page.",
  actionLabel = "Go back",
  actionTo = "/",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
