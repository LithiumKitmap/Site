
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (email, password, passwordConfirm) => {
    const record = await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
      role: 'user',
      cagnotte: 0
    });
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const authWithOAuth2 = (provider) => {
    return pb.collection('users').authWithOAuth2({ provider })
      .then((authData) => {
        setCurrentUser(authData.record);
        return authData;
      });
  };

  const refreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.model) {
      try {
        const user = await pb.collection('users').getOne(pb.authStore.model.id, { $autoCancel: false });
        setCurrentUser(user);
        return user;
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  const isAuthenticated = pb.authStore.isValid && currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isAdmin,
      login,
      signup,
      logout,
      authWithOAuth2,
      refreshUser,
      initialLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
