
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated, currentUser]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const items = await pb.collection('cart').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setCartItems(items);
      setCartCount(items.length);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated');
    }

    try {
      // Check if item already exists in cart
      const existingItems = await pb.collection('cart').getList(1, 1, {
        filter: `userId = "${currentUser.id}" && productId = "${product.id}"`,
        $autoCancel: false
      });

      if (existingItems.items.length > 0) {
        throw new Error('Item already in cart');
      }

      const cartItem = await pb.collection('cart').create({
        userId: currentUser.id,
        productId: product.id,
        productName: product.name,
        price: product.price,
        addedDate: new Date().toISOString()
      }, { $autoCancel: false });

      setCartItems(prev => [cartItem, ...prev]);
      setCartCount(prev => prev + 1);
      return cartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await pb.collection('cart').delete(itemId, { $autoCancel: false });
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setCartCount(prev => prev - 1);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Delete all items one by one (PocketBase doesn't support bulk delete via API yet)
      const promises = cartItems.map(item => 
        pb.collection('cart').delete(item.id, { $autoCancel: false })
      );
      await Promise.all(promises);
      setCartItems([]);
      setCartCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const assignClientRole = async (userId) => {
    try {
      const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
      // Only update if role is 'user' (don't downgrade admins)
      if (user.role === 'user') {
        await pb.collection('users').update(userId, { role: 'client' }, { $autoCancel: false });
      }
    } catch (error) {
      console.error('Error assigning client role:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      fetchCartItems,
      assignClientRole
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
