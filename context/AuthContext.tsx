import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Citizen } from '../types';
import * as userService from '../services/userService';

type UserType = 'citizen' | 'worker' | 'sanitation-officer' | 'city-engineer' | 'deputy-commissioner' | 'municipal-commissioner' | null;

interface AuthContextType {
  userType: UserType;
  currentUser: Citizen | null;
  currentWorker: string | null;
  login: (type: UserType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>(() => sessionStorage.getItem('userType') as UserType | null);
  const [currentUser, setCurrentUser] = useState<Citizen | null>(() => {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
  });
  const [currentWorker, setCurrentWorker] = useState<string | null>(() => sessionStorage.getItem('currentWorker'));
  const navigate = useNavigate();

  const login = async (type: UserType) => {
    if (!type) return;
    
    sessionStorage.setItem('userType', type);
    setUserType(type);

    // Clear other user types' data
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    sessionStorage.removeItem('currentWorker');
    setCurrentWorker(null);

    if (type === 'worker') {
        const workerName = 'John Smith'; // For demo purposes
        sessionStorage.setItem('currentWorker', workerName);
        setCurrentWorker(workerName);
        navigate('/worker');
    } else if (type === 'citizen') {
        // For demo purposes, we log in a hardcoded citizen user.
        const users = await userService.getUsers();
        const userToLogin = users.find(u => u.id === 'citizen-1') || users[0];
        if(userToLogin) {
            sessionStorage.setItem('currentUser', JSON.stringify(userToLogin));
            setCurrentUser(userToLogin);
        }
        navigate('/citizen');
    } else { // All admin roles
        navigate(`/${type}`);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentWorker');
    setUserType(null);
    setCurrentUser(null);
    setCurrentWorker(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ userType, currentUser, currentWorker, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};