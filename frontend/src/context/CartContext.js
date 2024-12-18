import React, { createContext, useContext, useState ,useEffect} from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem('token'); // Ensure the token is retrieved correctly
  const updateCart = (newCart) => setCart(newCart);  // Make sure `setCart` properly updates the cart
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
  // Fetch the cart for the current user
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (response.data.success) {
          setCart(response.data.cart.items);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
  
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Add product to cart or update quantity if it exists
  // Add product to cart or update quantity if it exists
const addToCart = (product) => {
  setCart((prevCart) => {
    const existingProduct = prevCart.find(item => item.productId === product._id);

    if (existingProduct) {
      // Update quantity if it exists
      return prevCart.map(item =>
        item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // Add new product with initial quantity of 1, ensuring the product name is set
      return [
        ...prevCart,
        {
          productId: product._id,
          productName: product.name, // Set the product name
          price: product.price,
          quantity: 1,
          minQuantityForNegotiation: product.minQuantityForNegotiation || 0,
          negotiationStatus: 'pending', // Default status when first added
        }
      ];
    }
  });
};

  // Update product price after negotiation
  const updateProductPrice = (productId, newPrice) => {
    setCart((prevCart) => {
      return prevCart.map(item =>
        item._id === productId ? { ...item, price: newPrice } : item
      );
    });
  };

  const checkout = async (customerId, customerAddress) => {
  try {
    const orderData = {
      userId: customerId,  // using the passed customerId
      items: cart,
      address: customerAddress,
    };

    const response = await axios.post(`${API_URL}/api/order/placeOrder`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      // Clear cart on successful checkout
      setCart([]);
      return { success: true, orderId: response.data.order._id };
    }
  } catch (error) {
    console.error('Checkout failed:', error);
    return { success: false, error };
  }
};

  
  return (
    <CartContext.Provider value={{ cart, addToCart, updateProductPrice,checkout }}>
      {children}
    </CartContext.Provider>
  );
};
