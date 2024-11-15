import React, { useState, useEffect } from 'react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch(`/api/order/customer/orders?userId=${currentUser._id}`);
      const ordersData = await response.json();
      setOrders(ordersData);
    };

    fetchOrders();
  }, []);

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
              <li key={item.productId._id}>
                {item.productId.name} - Qty: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrderTracking;
