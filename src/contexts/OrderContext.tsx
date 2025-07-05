
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber?: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  timestamp: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: OrderItem[];
  selectedTable: number | null;
  addItemToOrder: (item: Omit<OrderItem, 'id' | 'quantity'>) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  setSelectedTable: (tableNumber: number | null) => void;
  submitOrder: () => void;
  clearCurrentOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

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
    if (currentOrder.length === 0) return;

    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now().toString(),
      tableNumber: selectedTable || undefined,
      items: [...currentOrder],
      total,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };

    setOrders([...orders, newOrder]);
    clearCurrentOrder();
  };

  const clearCurrentOrder = () => {
    setCurrentOrder([]);
    setSelectedTable(null);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      selectedTable,
      addItemToOrder,
      removeItemFromOrder,
      updateItemQuantity,
      setSelectedTable,
      submitOrder,
      clearCurrentOrder,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};
