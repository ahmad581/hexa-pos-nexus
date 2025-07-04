
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ title, value, change, changeType, icon: Icon, color }: StatCardProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className={`text-sm mt-1 ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Card>
  );
};
