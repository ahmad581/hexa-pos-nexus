import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface InventoryItem {
  id: string;
  warehouse_id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_price?: number;
  supplier?: string;
  last_restocked?: string;
  expiry_date?: string;
  status: 'Normal' | 'Low Stock' | 'Out of Stock' | 'Overstock' | 'Expired';
  created_at: string;
  updated_at: string;
  warehouse?: {
    id: string;
    name: string;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  phone?: string;
  manager_name?: string;
  is_active: boolean;
}

export interface InventoryRequest {
  id: string;
  branch_id: string;
  warehouse_id: string;
  inventory_item_id: string;
  requested_quantity: number;
  approved_quantity?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  request_notes?: string;
  approved_by?: string;
  requested_at: string;
  approved_at?: string;
  fulfilled_at?: string;
  inventory_item?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export const useInventory = (branchId?: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [branchId]);

  const fetchData = async () => {
    try {
      if (!userProfile?.business_id) {
        console.log('No business_id found in user profile');
        setLoading(false);
        return;
      }

      let itemsQuery = supabase
        .from('inventory_items')
        .select(`
          *,
          warehouse:warehouses(id, name)
        `)
        .eq('business_id', userProfile.business_id)
        .order('name');

      let requestsQuery = supabase
        .from('inventory_requests')
        .select(`
          *,
          inventory_item:inventory_items(id, name, sku),
          warehouse:warehouses(id, name)
        `)
        .eq('business_id', userProfile.business_id)
        .order('requested_at', { ascending: false });

      let warehousesQuery = supabase
        .from('warehouses')
        .select('*')
        .eq('business_id', userProfile.business_id)
        .eq('is_active', true)
        .order('name');

      // Filter requests by branch if branchId is provided
      // Note: We don't filter inventory items by branch - all users should see
      // all business inventory so they can request items from any warehouse
      if (branchId) {
        requestsQuery = requestsQuery.eq('requesting_branch_id', branchId);
      }

      const [itemsResponse, warehousesResponse, requestsResponse] = await Promise.all([
        itemsQuery,
        warehousesQuery,
        requestsQuery
      ]);

      if (itemsResponse.error) throw itemsResponse.error;
      if (warehousesResponse.error) throw warehousesResponse.error;
      if (requestsResponse.error) throw requestsResponse.error;

      setItems((itemsResponse.data as InventoryItem[]) || []);
      setWarehouses(warehousesResponse.data || []);
      setRequests((requestsResponse.data as InventoryRequest[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const resolvedBranchId = branchId ?? localStorage.getItem('userBranchId');
      if (!resolvedBranchId) {
        toast.error('No branch selected. Please select a branch and try again.');
        throw new Error('Missing branchId');
      }

      if (!userProfile?.business_id) {
        toast.error('No business associated with user');
        throw new Error('No business_id');
      }

      const itemWithBranch = {
        ...item,
        branch_id: resolvedBranchId,
        business_id: userProfile.business_id
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemWithBranch])
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message.includes('sku')) {
          toast.error('An item with this SKU already exists. Please use a unique SKU.');
        } else {
          toast.error('Failed to add item');
        }
        throw error;
      }

      await fetchData();
      toast.success('Item added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding item:', error);
      if (!error?.code) {
        toast.error('Failed to add item');
      }
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      throw error;
    }
  };

  const updateStock = async (id: string, quantity: number, transactionType: 'Add' | 'Remove' | 'Adjustment', reason?: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) throw new Error('Item not found');

      const newStock = transactionType === 'Add' 
        ? item.current_stock + quantity 
        : transactionType === 'Remove'
        ? Math.max(0, item.current_stock - quantity)
        : quantity;

      // Update inventory item
      await updateItem(id, { current_stock: newStock });

      // Record transaction
      await supabase
        .from('inventory_transactions')
        .insert([{
          inventory_item_id: id,
          transaction_type: transactionType,
          quantity: transactionType === 'Adjustment' ? newStock - item.current_stock : quantity,
          reason,
          performed_by: 'Current User' // This would be the actual user in a real app
        }]);

      toast.success('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      throw error;
    }
  };

  const requestStock = async (request: Omit<InventoryRequest, 'id' | 'requested_at' | 'status'>) => {
    try {
      const resolvedBranchId = branchId ?? localStorage.getItem('userBranchId') ?? undefined;

      if (!userProfile?.business_id) {
        toast.error('No business associated with user');
        throw new Error('No business_id');
      }

      const requestWithBranch = {
        ...request,
        ...(resolvedBranchId ? { requesting_branch_id: resolvedBranchId } : {}),
        business_id: userProfile.business_id,
        status: 'Pending'
      };

      const { data, error } = await supabase
        .from('inventory_requests')
        .insert([requestWithBranch])
        .select()
        .single();

      if (error) throw error;

      await fetchData();
      toast.success('Stock request submitted successfully');
      return data;
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
      throw error;
    }
  };

  const approveRequest = async (id: string, approvedQuantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory_requests')
        .update({
          status: 'Approved',
          approved_quantity: approvedQuantity,
          approved_by: 'Current User', // This would be the actual user in a real app
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast.success('Request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
      throw error;
    }
  };

  const fulfillRequest = async (id: string) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request || request.status !== 'Approved') {
        throw new Error('Request not found or not approved');
      }

      // Update stock in warehouse
      await updateStock(
        request.inventory_item_id,
        request.approved_quantity || request.requested_quantity,
        'Remove',
        `Fulfilled request for branch ${request.branch_id}`
      );

      // Mark request as fulfilled
      const { error } = await supabase
        .from('inventory_requests')
        .update({
          status: 'Fulfilled',
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast.success('Request fulfilled successfully');
    } catch (error) {
      console.error('Error fulfilling request:', error);
      toast.error('Failed to fulfill request');
      throw error;
    }
  };

  const addWarehouse = async (warehouse: { name: string; address: string; phone?: string; manager_name?: string }) => {
    try {
      if (!userProfile?.business_id) {
        toast.error('No business associated with user');
        throw new Error('No business_id');
      }

      const { data, error } = await supabase
        .from('warehouses')
        .insert([{
          ...warehouse,
          business_id: userProfile.business_id,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchData();
      toast.success('Warehouse created successfully');
      return data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast.error('Failed to create warehouse');
      throw error;
    }
  };

  return {
    items,
    warehouses,
    requests,
    loading,
    addItem,
    updateItem,
    deleteItem,
    updateStock,
    requestStock,
    approveRequest,
    fulfillRequest,
    addWarehouse,
    refetch: fetchData
  };
};