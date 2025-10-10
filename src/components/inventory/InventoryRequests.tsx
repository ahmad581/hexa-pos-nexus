import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Eye,
  Search,
  Filter 
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useTranslation } from "@/contexts/TranslationContext";

export const InventoryRequests = () => {
  const { t } = useTranslation();
  const { requests, approveRequest, fulfillRequest, loading } = useInventory();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalQuantity, setApprovalQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Approved": return "bg-blue-500/20 text-blue-400";
      case "Rejected": return "bg-red-500/20 text-red-400";
      case "Fulfilled": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="h-4 w-4" />;
      case "Approved": return <CheckCircle className="h-4 w-4" />;
      case "Rejected": return <XCircle className="h-4 w-4" />;
      case "Fulfilled": return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.inventory_item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.inventory_item?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.branch_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (requestId: string, quantity: number) => {
    try {
      await approveRequest(requestId, quantity);
      setSelectedRequest(null);
      setApprovalQuantity("");
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleFulfill = async (requestId: string) => {
    try {
      await fulfillRequest(requestId);
    } catch (error) {
      console.error('Error fulfilling request:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('inventoryRequests.title')}</h2>
          <p className="text-gray-400">{t('inventoryRequests.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('inventoryRequests.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder={t('inventoryRequests.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventoryRequests.allStatuses')}</SelectItem>
            <SelectItem value="Pending">{t('inventoryRequests.pending')}</SelectItem>
            <SelectItem value="Approved">{t('inventoryRequests.approved')}</SelectItem>
            <SelectItem value="Rejected">{t('inventoryRequests.rejected')}</SelectItem>
            <SelectItem value="Fulfilled">{t('inventoryRequests.fulfilled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {request.inventory_item?.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {t('inventory.sku')}: {request.inventory_item?.sku}
                </p>
              </div>
              <Badge className={getStatusColor(request.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(request.status)}
                  {request.status}
                </span>
              </Badge>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <span className="font-medium">{t('inventoryRequests.branch')}:</span> {request.branch_id}
              </div>
              <div>
                <span className="font-medium">{t('inventoryRequests.warehouse')}:</span> {request.warehouse?.name}
              </div>
              <div>
                <span className="font-medium">{t('inventoryRequests.requested')}:</span> {request.requested_quantity} {t('inventoryReports.units')}
              </div>
              {request.approved_quantity && (
                <div>
                  <span className="font-medium">{t('inventoryRequests.approvedQty')}:</span> {request.approved_quantity} {t('inventoryReports.units')}
                </div>
              )}
              <div>
                <span className="font-medium">{t('inventoryRequests.requestedDate')}:</span>{' '}
                {new Date(request.requested_at).toLocaleDateString()}
              </div>
              {request.request_notes && (
                <div>
                  <span className="font-medium">{t('inventoryRequests.notes')}:</span> {request.request_notes}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {request.status === 'Pending' && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalQuantity(request.requested_quantity.toString());
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('inventoryRequests.approve')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>{t('inventoryRequests.approve')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-300 mb-2">
                            {t('inventoryRequests.item')}: {request.inventory_item?.name}
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            {t('inventoryRequests.requested')}: {request.requested_quantity} {t('inventoryReports.units')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="approval_quantity">{t('inventoryRequests.approvedQty')}</Label>
                          <Input
                            id="approval_quantity"
                            type="number"
                            value={approvalQuantity}
                            onChange={(e) => setApprovalQuantity(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            min="1"
                            max={request.requested_quantity}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                            {t('inventory.itemDialog.cancel')}
                          </Button>
                          <Button
                            onClick={() => handleApprove(request.id, parseInt(approvalQuantity))}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t('inventoryRequests.approve')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t('inventoryRequests.reject')}
                  </Button>
                </>
              )}
              
              {request.status === 'Approved' && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleFulfill(request.id)}
                >
                  <Truck className="h-4 w-4 mr-1" />
                  {t('inventoryRequests.fulfilled')}
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                    <Eye className="h-4 w-4 mr-1" />
                    {t('inventoryRequests.view')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{t('inventoryRequests.details')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.item')}:</span>
                        <p>{request.inventory_item?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{t('inventory.sku')}:</span>
                        <p>{request.inventory_item?.sku}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.branch')}:</span>
                        <p>{request.branch_id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.warehouse')}:</span>
                        <p>{request.warehouse?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.requestedQuantity')}:</span>
                        <p>{request.requested_quantity} {t('inventoryReports.units')}</p>
                      </div>
                      {request.approved_quantity && (
                        <div>
                          <span className="font-medium text-gray-400">{t('inventoryRequests.approvedQty')}:</span>
                          <p>{request.approved_quantity} {t('inventoryReports.units')}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.status')}:</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.requestedDate')}:</span>
                        <p>{new Date(request.requested_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {request.request_notes && (
                      <div>
                        <span className="font-medium text-gray-400">{t('inventoryRequests.notes')}:</span>
                        <p className="mt-1 text-sm bg-gray-700 p-2 rounded">
                          {request.request_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('inventoryRequests.noResults')}</p>
        </div>
      )}
    </div>
  );
};