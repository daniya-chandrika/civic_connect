import { Citizen } from '../types';

const USERS_KEY = 'civic_connect_users';

const getInitialMockUsers = (): Citizen[] => [
    { id: 'citizen-1', name: 'Jane Doe', points: 50 },
    { id: 'citizen-2', name: 'John Appleseed', points: 30 },
    { id: 'citizen-3', name: 'Alice Johnson', points: 70 },
    { id: 'citizen-4', name: 'Bob Williams', points: 10 },
];

const getStoredUsers = (): Citizen[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    }
  } catch (error) {
    console.error("Could not parse users from localStorage", error);
  }
  const mockUsers = getInitialMockUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  return mockUsers;
};

const storeUsers = (users: Citizen[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getUsers = async (): Promise<Citizen[]> => {
  await new Promise(res => setTimeout(res, 400));
  return getStoredUsers();
};

export const addPoints = async (userId: string, pointsToAdd: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 100));
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].points += pointsToAdd;
        storeUsers(users);
    } else {
        console.warn(`Attempted to add points to non-existent user: ${userId}`);
    }
};