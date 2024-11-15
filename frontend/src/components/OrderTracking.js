import React, { useEffect, useState } from 'react';

const OrderTracking = ({ customerId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (customerId) { // Check if customerId is provided
        try {
          const response = await fetch(`/api/order/customer/orders?userId=${customerId}`);
          const ordersData = await response.json();
          setOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };

    fetchOrders();
  }, [customerId]);

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.map(order => (
        <div key={order._id}>
          <p>Order #{order._id}</p>
          <p>Status: {order.status}</p>
          <p>Address: {order.address}</p>
          <ul>
            {order.items.map(item => (
              <li key={item.productId._id}>{item.productId.name} - Qty: {item.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrderTracking;
