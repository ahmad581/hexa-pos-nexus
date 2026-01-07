
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBranch } from './BranchContext';
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  branchId: string;
  branchName: string;
  tableNumber?: string;
  customerInfo?: {
    name: string;
    phone: string;
    address?: string;
  };
  orderType: 'dine-in' | 'takeout' | 'delivery' | 'phone';
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  timestamp: string;
  notes?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: OrderItem[];
  selectedTable: string | null;
  editingOrderId: string | null;
  orderType: Order['orderType'];
  customerInfo: Order['customerInfo'];
  orderNotes: string;
  addItemToOrder: (item: Omit<OrderItem, 'id' | 'quantity'>) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  setSelectedTable: (tableNumber: string | null) => void;
  setOrderType: (type: Order['orderType']) => void;
  setCustomerInfo: (info: Order['customerInfo']) => void;
  setOrderNotes: (notes: string) => void;
  submitOrder: () => Promise<boolean>;
  clearCurrentOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  loadOrderForEditing: (tableNumber: string, branchId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { selectedBranch } = useBranch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<Order['orderType']>('dine-in');
  const [customerInfo, setCustomerInfo] = useState<Order['customerInfo']>();
  const [orderNotes, setOrderNotes] = useState<string>('');

  const addItemToOrder = (item: Omit<OrderItem, 'id' | 'quantity'>) => {
    const existingItem = currentOrder.find(orderItem => orderItem.name === item.name);
    
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem =>
        orderItem.id === existingItem.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        ...item,
        quantity: 1
      };
      setCurrentOrder([...currentOrder, newItem]);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
    } else {
      setCurrentOrder(currentOrder.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const submitOrder = async (): Promise<boolean> => {
    if (currentOrder.length === 0 || !selectedBranch) return false;

    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get table UUID if dine-in
    let tableId: string | null = null;
    if (orderType === 'dine-in' && selectedTable) {
      const { data: tableData } = await supabase
        .from('tables')
        .select('id')
        .eq('branch_id', selectedBranch.id)
        .eq('table_number', selectedTable)
        .single();
      tableId = tableData?.id || null;
    }

    // If editing an existing order, update it instead of creating new
    if (editingOrderId) {
      // Delete old order items and insert new ones
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editingOrderId);

      const orderItems = currentOrder.map(item => ({
        order_id: editingOrderId,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error updating order items:', itemsError);
        return false;
      }

      // Update order total and notes
      await supabase
        .from('orders')
        .update({ 
          total_amount: total,
          notes: orderNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOrderId);

      clearCurrentOrder();
      return true;
    }

    // Generate order number for new orders
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Insert order into database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        branch_id: selectedBranch.id,
        order_number: orderNumber,
        table_id: tableId,
        customer_name: customerInfo?.name || null,
        customer_phone: customerInfo?.phone || null,
        notes: orderNotes || null,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return false;
    }

    // Insert order items
    const orderItems = currentOrder.map(item => ({
      order_id: orderData.id,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return false;
    }

    // Update table status to occupied if dine-in
    if (tableId) {
      await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', tableId);
    }

    // Also update local state
    const newOrder: Order = {
      id: orderData.id,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      tableNumber: orderType === 'dine-in' ? selectedTable || undefined : undefined,
      customerInfo: orderType !== 'dine-in' ? customerInfo : undefined,
      orderType,
      items: [...currentOrder],
      total,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
      notes: orderNotes || undefined
    };

    setOrders([...orders, newOrder]);
    clearCurrentOrder();
    return true;
  };

  const clearCurrentOrder = () => {
    setCurrentOrder([]);
    setSelectedTable(null);
    setEditingOrderId(null);
    setCustomerInfo(undefined);
    setOrderType('dine-in');
    setOrderNotes('');
  };

  const loadOrderForEditing = async (tableNumber: string, branchId: string) => {
    // Get table ID from table_number
    const { data: tableData } = await supabase
      .from('tables')
      .select('id')
      .eq('branch_id', branchId)
      .eq('table_number', tableNumber)
      .single();

    if (!tableData) {
      setCurrentOrder([]);
      setEditingOrderId(null);
      return;
    }

    // Get the most recent active order for this table
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        id,
        notes,
        order_items (id, product_name, unit_price, quantity)
      `)
      .eq('table_id', tableData.id)
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderData && orderData.order_items) {
      const items: OrderItem[] = orderData.order_items.map((item: any) => ({
        id: item.id,
        name: item.product_name,
        price: item.unit_price,
        quantity: item.quantity,
      }));
      setCurrentOrder(items);
      setEditingOrderId(orderData.id);
      setOrderNotes(orderData.notes || '');
    } else {
      setCurrentOrder([]);
      setEditingOrderId(null);
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      selectedTable,
      editingOrderId,
      orderType,
      customerInfo,
      orderNotes,
      addItemToOrder,
      removeItemFromOrder,
      updateItemQuantity,
      setSelectedTable,
      setOrderType,
      setCustomerInfo,
      setOrderNotes,
      submitOrder,
      clearCurrentOrder,
      updateOrderStatus,
      deleteOrder,
      loadOrderForEditing
    }}>
      {children}
    </OrderContext.Provider>
  );
};
