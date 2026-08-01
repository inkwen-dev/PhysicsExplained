/**
 * Projects configuration
 * Manages information about other projects to promote
 */

export interface Project {
  id: string;                    // Unique identifier
  name: string;                  // Project name
  description: string;           // Project description
  url: string;                   // Project URL
  featured: boolean;             // Whether to display on article pages
  priority?: number;             // Priority for display order (lower number = higher priority)
  icon?: string;                 // Optional: project icon URL
}

export const projects: Project[] = [
  {
    id: 'wallpapersense',
    name: 'WallpaperSense',
    description: 'Discover beautiful wallpapers that understand your aesthetic sense',
    url: 'https://wallpapersense.com',
    featured: true,
    priority: 1,  // Highest priority - displayed on article pages
  },
  {
    id: 'inkwellflow',
    name: 'InkwellFlow',
    description: 'Stop Writing Like a Robot，Write Like You',
    url: 'https://inkwellflow.com',
    featured: true,
    priority: 2,
  },
  {
    id: 'startupsense',
    name: 'StartupSense',
    description: 'AI-Powered Startup Validation',
    url: 'https://startupsense.co',
    featured: true,
    priority: 3,
  },
  {
    id: 'physicsexplained',
    name: 'Physics Explained',
    description: 'Understanding Physics, Simply Explained.',
    url: 'https://physicsexplained.org',
    featured: true,
    priority: 4,
  },
  {
    id: 'humannatureexplained',
    name: 'Human Nature Explained',
    description: 'Understanding Human Nature, Simply Explained.',
    url: 'https://humannatureexplained.org',
    featured: true,
    priority: 5,
  },
  {
    id: 'maxtool',
    name: 'MaxTool',
    description: 'Free Online Tools - Simple & Fast. No registration required.',
    url: 'https://maxtool.me',
    featured: true,
    priority: 6,  // Lowest priority
  },
];

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return projects;
}

/**
 * Get featured projects (displayed on article pages)
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}

/**
 * Get primary project (priority = 1, displayed prominently on article pages)
 */
export function getPrimaryProject(): Project | null {
  const primary = projects.find(p => p.priority === 1);
  return primary || null;
}
