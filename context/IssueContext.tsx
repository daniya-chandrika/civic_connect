import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Issue, Category, Priority, Status } from '../types';
import * as issueService from '../services/issueService';
import * as geminiService from '../services/geminiService';
import * as userService from '../services/userService';
import { useAuth } from './AuthContext';
import { CATEGORY_TO_DEPARTMENT_MAP } from '../constants';

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  getIssueById: (id: string) => Promise<Issue | undefined>;
  addIssue: (issueData: {
    title: string;
    description: string;
    location: string;
    category: Category;
    priority: Priority; // This is the user-selected initial priority
    imageUrl?: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  updateIssue: (
    id: string,
    updates: Partial<Omit<Issue, 'id' | 'history' | 'notes' | 'createdAt'>>,
    historyNote: string
  ) => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedIssues = await issueService.getIssues();
        setIssues(fetchedIssues);
      } catch (err) {
        setError('Failed to load issues.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const getIssueById = useCallback(async (id: string) => {
    const existingIssue = issues.find(issue => issue.id === id);
    if (existingIssue) return existingIssue;
    return issueService.getIssueById(id);
  }, [issues]);
  
  const addIssue = async (issueData: {
    title: string;
    description: string;
    location: string;
    category: Category;
    priority: Priority;
    imageUrl?: string;
    latitude: number;
    longitude: number;
  }) => {
    if (!currentUser) {
        throw new Error("Cannot add issue: user not logged in.");
    }
    
    const { latitude, longitude, ...restOfIssueData } = issueData;
    const locationHash = issueService.generateLocationHash(latitude, longitude);

    const existingIssue = issues.find(i => i.locationHash === locationHash && i.status !== Status.RESOLVED);

    if (existingIssue) {
        if (existingIssue.reporterId === currentUser.id) {
            // Same user reporting the same issue
            throw new Error("DUPLICATE_REPORT");
        } else {
            // Different user reporting the same issue, increase priority
            const newPriorityScore = existingIssue.priorityScore + 1;
            const newPriority = issueService.getPriorityFromScore(newPriorityScore);
            const newDeadline = issueService.calculateDeadline(existingIssue.createdAt, newPriorityScore);
            
            await updateIssue(existingIssue.id, {
                priorityScore: newPriorityScore,
                priority: newPriority,
                deadline: newDeadline,
            }, `Priority increased to ${newPriorityScore} due to a report from another citizen.`);
            return; // Exit without creating a new issue
        }
    }

    // This is a new issue
    try {
        // Automatically assign department based on category
        const assignedDepartment = CATEGORY_TO_DEPARTMENT_MAP[issueData.category];
        
        const priorityScore = 1; // Initial score for a new issue
        const createdAt = new Date().toISOString();
        const deadline = issueService.calculateDeadline(createdAt, priorityScore);

        const newIssueData = {
            ...restOfIssueData,
            assignedTo: assignedDepartment,
            reporterId: currentUser.id,
            reporterName: currentUser.name,
            locationHash,
            priorityScore,
            deadline,
            createdAt,
            status: Status.SUBMITTED,
        };

        const newIssue = await issueService.addIssue(newIssueData);
        setIssues(prevIssues => [newIssue, ...prevIssues]);
    } catch(err) {
        console.error("Failed to add issue", err);
        setError("Failed to add new issue. Please try again.");
        throw err; // Re-throw to be caught by the form
    }
  };

  const updateIssue = async (
    id: string,
    updates: Partial<Omit<Issue, 'id' | 'history' | 'notes' | 'createdAt'>>,
    historyNote: string
  ) => {
    try {
        const originalIssue = issues.find(i => i.id === id);
        const isBeingResolved = updates.status === Status.RESOLVED && originalIssue?.status !== Status.RESOLVED;

        if (originalIssue && isBeingResolved) {
            await userService.addPoints(originalIssue.reporterId, 10);
            // Optionally, you could add a system note about the points.
        }

        const updatedIssue = await issueService.updateIssue(id, updates, historyNote);
        if (updatedIssue) {
          setIssues(prevIssues =>
            prevIssues.map(issue => (issue.id === id ? updatedIssue : issue))
          );
        }
    } catch(err) {
        console.error("Failed to update issue", err);
        setError("Failed to update issue. Please try again.");
    }
  };

  return (
    <IssueContext.Provider value={{ issues, loading, error, getIssueById, addIssue, updateIssue }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = (): IssueContextType => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
