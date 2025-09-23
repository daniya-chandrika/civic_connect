import { Issue, Status, Category, Priority } from '../types';

const ISSUES_KEY = 'civic_connect_issues';

// --- UTILITY FUNCTIONS ---

/**
 * Generates a consistent hash from GPS coordinates, rounded to ~10 meters.
 */
export const generateLocationHash = (lat: number, lon: number): string => {
  return `loc-${lat.toFixed(4)}-${lon.toFixed(4)}`;
};

/**
 * Determines the Priority level based on a numeric score.
 */
export const getPriorityFromScore = (score: number): Priority => {
  if (score >= 7) return Priority.HIGH;
  if (score >= 4) return Priority.MEDIUM;
  return Priority.LOW;
};

/**
 * Calculates a deadline based on the issue's creation date and priority score.
 * Higher priority means a shorter deadline.
 */
export const calculateDeadline = (createdAt: string, priorityScore: number): string => {
  const creationDate = new Date(createdAt);
  let daysToAdd = 14; // Default for Low priority

  if (priorityScore >= 7) { // High
    daysToAdd = 3;
  } else if (priorityScore >= 4) { // Medium
    daysToAdd = 7;
  }

  creationDate.setDate(creationDate.getDate() + daysToAdd);
  return creationDate.toISOString();
};


/**
 * Formats a deadline into a human-readable string (e.g., "Due in 3 days").
 */
export const formatDeadline = (deadline: string): string => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${diffDays} days`;
};


// --- MOCK DATA AND SERVICE FUNCTIONS ---

const getInitialMockIssues = (): Issue[] => [
    {
      id: '1',
      title: 'Large Pothole on Main St',
// Fix: Corrected typo from POTHOTET to POTHOLE
      category: Category.POTHOLE,
      description: 'There is a large, dangerous pothole in the eastbound lane of Main St, right before the intersection with Oak Ave. It has caused several cars to swerve suddenly.',
      location: 'Lat: 40.7128, Lon: -74.0060',
      locationHash: 'loc-40.7128--74.0060',
      priority: Priority.HIGH,
      priorityScore: 8,
      status: Status.SUBMITTED,
      reporterId: 'citizen-1',
      reporterName: 'Jane Doe',
      assignedTo: 'Public Works',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: calculateDeadline(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 8),
      notes: [],
      history: [{ status: Status.SUBMITTED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Issue submitted by citizen. High priority due to multiple reports.' }],
      imageUrl: 'https://via.placeholder.com/400x300.png?text=Pothole'
    },
    {
      id: '2',
      title: 'Streetlight out on 5th Ave',
      category: Category.STREETLIGHT,
      description: 'The streetlight at the corner of 5th Avenue and Pine Street is completely out. It makes the intersection very dark and unsafe at night.',
      location: 'Lat: 40.7306, Lon: -73.9352',
      locationHash: 'loc-40.7306--73.9352',
      priority: Priority.MEDIUM,
      priorityScore: 4,
      status: Status.IN_PROGRESS,
      reporterId: 'citizen-2',
      reporterName: 'John Appleseed',
      assignedTo: 'Public Works',
      assignedWorker: 'John Smith',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: calculateDeadline(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 4),
      notes: ["Scheduled for repair on Monday."],
      history: [
        { status: Status.IN_PROGRESS, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Status changed to In Progress. Assigned to Public Works and worker John Smith.' },
        { status: Status.SUBMITTED, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Issue submitted by citizen.' },
      ],
      imageUrl: 'https://via.placeholder.com/400x300.png?text=Broken+Streetlight'
    },
    {
      id: '3',
      title: 'Overflowing trash can at City Park',
      category: Category.TRASH,
      description: 'The main trash can near the playground at City Park is overflowing with garbage. It needs to be emptied as soon as possible.',
      location: 'Lat: 40.7851, Lon: -73.9683',
      locationHash: 'loc-40.7851--73.9683',
      priority: Priority.LOW,
      priorityScore: 1,
      status: Status.RESOLVED,
      reporterId: 'citizen-3',
      reporterName: 'Alice Johnson',
      assignedTo: 'Sanitation',
      assignedWorker: 'Maria Garcia',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: calculateDeadline(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 1),
      notes: ["Sanitation crew emptied the can and cleaned the area."],
      history: [
        { status: Status.RESOLVED, timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), note: 'Status changed to Resolved. Trash was collected.' },
        { status: Status.IN_PROGRESS, timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), note: 'Status changed to In Progress. Assigned to Sanitation.' },
        { status: Status.SUBMITTED, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), note: 'Issue submitted by citizen.' }
      ],
      imageUrl: 'https://via.placeholder.com/400x300.png?text=Overflowing+Trash'
    },
];

const getStoredIssues = (): Issue[] => {
  try {
    const issuesJson = localStorage.getItem(ISSUES_KEY);
    if (issuesJson) {
      return JSON.parse(issuesJson);
    }
  } catch (error) {
    console.error("Could not parse issues from localStorage", error);
  }
  const mockIssues = getInitialMockIssues();
  localStorage.setItem(ISSUES_KEY, JSON.stringify(mockIssues));
  return mockIssues;
};

const storeIssues = (issues: Issue[]) => {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
};

export const getIssues = async (): Promise<Issue[]> => {
  await new Promise(res => setTimeout(res, 500));
  return getStoredIssues();
};

export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  await new Promise(res => setTimeout(res, 300));
  const issues = getStoredIssues();
  return issues.find(issue => issue.id === id);
};

export const addIssue = async (issueData: Omit<Issue, 'id' | 'updatedAt' | 'notes' | 'history'>): Promise<Issue> => {
  await new Promise(res => setTimeout(res, 700));
  const issues = getStoredIssues();
  const now = new Date().toISOString();

  let initialNote = 'Issue submitted by citizen.';
  if (issueData.assignedTo) {
      initialNote = `Issue submitted by citizen. Automatically assigned to ${issueData.assignedTo}.`;
  }

  const newIssue: Issue = {
    id: Date.now().toString(),
    ...issueData,
    status: Status.SUBMITTED,
    updatedAt: now,
    notes: [],
    history: [{ status: Status.SUBMITTED, timestamp: now, note: initialNote }],
  };
  const updatedIssues = [newIssue, ...issues];
  storeIssues(updatedIssues);
  return newIssue;
};

export const updateIssue = async (
  id: string,
  updates: Partial<Omit<Issue, 'id' | 'history' | 'notes' | 'createdAt'>>,
  historyNote: string
): Promise<Issue | undefined> => {
  await new Promise(res => setTimeout(res, 500));
  let issues = getStoredIssues();
  const issueIndex = issues.findIndex(issue => issue.id === id);
  if (issueIndex === -1) {
    return undefined;
  }
  
  const originalIssue = issues[issueIndex];
  const now = new Date().toISOString();
  
  const updatedIssue: Issue = {
    ...originalIssue,
    ...updates,
    updatedAt: now,
  };

  if (historyNote) {
    updatedIssue.history = [
      {
        status: updatedIssue.status,
        timestamp: now,
        note: historyNote,
      },
      ...originalIssue.history,
    ];
  }

  issues[issueIndex] = updatedIssue;
  storeIssues(issues);
  return updatedIssue;
};