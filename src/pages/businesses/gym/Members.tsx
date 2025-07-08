
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Activity } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  joinDate: string;
  lastVisit: string;
  status: "Active" | "Expired" | "Frozen";
}

const initialMembers: Member[] = [
  { id: "1", name: "John Doe", email: "john@email.com", membershipType: "Premium", joinDate: "2023-01-15", lastVisit: "2023-12-01", status: "Active" },
  { id: "2", name: "Jane Smith", email: "jane@email.com", membershipType: "Basic", joinDate: "2023-06-01", lastVisit: "2023-11-28", status: "Active" },
];

export const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400";
      case "Expired": return "bg-red-500/20 text-red-400";
      case "Frozen": return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Members</h1>
          <p className="text-gray-400">Manage gym memberships</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <User size={16} className="mr-2" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Membership: {member.membershipType}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">Joined: {member.joinDate}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Activity size={16} className="mr-2" />
                <span className="text-sm">Last visit: {member.lastVisit}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
