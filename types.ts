export enum Status {
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export enum Category {
  POTHOLE = 'Pothole',
  STREETLIGHT = 'Broken Streetlight',
  TRASH = 'Trash & Recycling',
  GRAFFITI = 'Graffiti',
  PARKS = 'Parks & Recreation',
  OTHER = 'Other',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Citizen {
  id: string;
  name: string;
  points: number;
}

export interface Issue {
  id:string;
  title: string;
  category: Category;
  description: string;
  location: string;
  imageUrl?: string;
  status: Status;
  priority: Priority;
  priorityScore: number;
  locationHash: string;
  deadline: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedWorker?: string;
  notes: string[];
  history: { status: Status; timestamp: string; note: string }[];
}