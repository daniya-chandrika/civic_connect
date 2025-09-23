import { Status, Category, Priority } from './types';

export const DEPARTMENTS = [
  'Public Works',
  'Parks & Recreation',
  'Sanitation',
  'Transportation',
  'Code Enforcement',
];

export const WORKERS = [
  'John Smith',
  'Maria Garcia',
  'David Chen',
  'Emily Rodriguez',
  'Michael Johnson',
];

export const STATUS_COLORS: Record<Status, string> = {
  [Status.SUBMITTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [Status.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [Status.RESOLVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [Priority.MEDIUM]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [Priority.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
    [Category.POTHOLE]: '🛣️',
    [Category.STREETLIGHT]: '💡',
    [Category.TRASH]: '🗑️',
    [Category.GRAFFITI]: '🎨',
    [Category.PARKS]: '🌳',
    [Category.OTHER]: '❓',
}

export const CATEGORY_TO_DEPARTMENT_MAP: Record<Category, string> = {
  [Category.POTHOLE]: DEPARTMENTS[0], // Public Works
  [Category.STREETLIGHT]: DEPARTMENTS[0], // Public Works
  [Category.TRASH]: DEPARTMENTS[2], // Sanitation
  [Category.GRAFFITI]: DEPARTMENTS[4], // Code Enforcement
  [Category.PARKS]: DEPARTMENTS[1], // Parks & Recreation
  [Category.OTHER]: DEPARTMENTS[0], // Public Works (default)
};