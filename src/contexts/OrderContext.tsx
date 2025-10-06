
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBranch } from './BranchContext';

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
  tableNumber?: number;
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
  selectedTable: number | null;
  orderType: Order['orderType'];
  customerInfo: Order['customerInfo'];
  orderNotes: string;
  addItemToOrder: (item: Omit<OrderItem, 'id' | 'quantity'>) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  setSelectedTable: (tableNumber: number | null) => void;
  setOrderType: (type: Order['orderType']) => void;
  setCustomerInfo: (info: Order['customerInfo']) => void;
  setOrderNotes: (notes: string) => void;
  submitOrder: () => void;
  clearCurrentOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
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
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
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

  const submitOrder = () => {
    if (currentOrder.length === 0 || !selectedBranch) return;

    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now().toString(),
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
  };

  const clearCurrentOrder = () => {
    setCurrentOrder([]);
    setSelectedTable(null);
    setCustomerInfo(undefined);
    setOrderType('dine-in');
    setOrderNotes('');
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
      deleteOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};
