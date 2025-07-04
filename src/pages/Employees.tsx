
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: "Active" | "Inactive";
  joinDate: string;
}

const initialEmployees: Employee[] = [
  { id: "1", name: "John Doe", email: "john@hexapos.com", role: "Manager", phone: "+1 234 567 8901", status: "Active", joinDate: "2023-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@hexapos.com", role: "Cashier", phone: "+1 234 567 8902", status: "Active", joinDate: "2023-03-20" },
  { id: "3", name: "Bob Johnson", email: "bob@hexapos.com", role: "Cook", phone: "+1 234 567 8903", status: "Inactive", joinDate: "2023-02-10" },
];

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", phone: "", status: "Active" as const });
  const { toast } = useToast();

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (selectedEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, ...formData }
          : emp
      ));
      toast({ title: "Employee updated successfully!" });
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setEmployees([...employees, newEmployee]);
      toast({ title: "Employee added successfully!" });
    }
    setIsDialogOpen(false);
    setSelectedEmployee(null);
    setFormData({ name: "", email: "", role: "", phone: "", status: "Active" });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({ name: employee.name, email: employee.email, role: employee.role, phone: employee.phone, status: employee.status });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast({ title: "Employee deleted successfully!", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          <p className="text-gray-400">Manage your team members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus size={16} className="mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
                {selectedEmployee ? "Update" : "Add"} Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 text-gray-400 font-medium">Phone</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 text-gray-400 font-medium">Join Date</th>
                <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-700">
                  <td className="py-3 text-white font-medium">{employee.name}</td>
                  <td className="py-3 text-gray-300">{employee.email}</td>
                  <td className="py-3 text-gray-300">{employee.role}</td>
                  <td className="py-3 text-gray-300">{employee.phone}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">{employee.joinDate}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(employee)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
