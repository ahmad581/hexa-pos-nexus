
import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  phone: string;
  hireDate: string;
}

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@hexapos.com",
      role: "Manager",
      status: "Active",
      phone: "(555) 123-4567",
      hireDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@hexapos.com",
      role: "Cashier",
      status: "Active",
      phone: "(555) 987-6543",
      hireDate: "2023-03-20"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@hexapos.com",
      role: "Server",
      status: "Inactive",
      phone: "(555) 456-7890",
      hireDate: "2023-02-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold text-white">{employee.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === "Active" 
                      ? "bg-green-600 text-white" 
                      : "bg-red-600 text-white"
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Role:</strong> {employee.role}</p>
                  </div>
                  <div>
                    <p><strong>Phone:</strong> {employee.phone}</p>
                    <p><strong>Hire Date:</strong> {employee.hireDate}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <Edit size={16} />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
