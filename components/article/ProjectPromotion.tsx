import Link from 'next/link';
import { getPrimaryProject, Project } from '@/config/projects';
import { cn } from '@/lib/utils';

interface ProjectPromotionProps {
  className?: string;            // Optional: custom CSS classes
  maxProjects?: number;           // Optional: maximum number of projects to display
}

function ProjectCard({ project, isPrimary = false }: { project: Project; isPrimary?: boolean }) {
  const cardClasses = isPrimary
    ? "block p-6 border-2 border-accent rounded-lg hover:border-accent-light hover:shadow-lg transition-all duration-200 group bg-accent/5 hover:bg-accent/10"
    : "block p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all duration-200 group bg-surface/50 hover:bg-surface";
  
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      <h3 className={`font-semibold text-primary group-hover:text-accent mb-2 transition-colors ${isPrimary ? 'text-xl' : 'text-lg'}`}>
        {project.name}
      </h3>
      <p className={`text-text-secondary leading-relaxed ${isPrimary ? 'text-base' : 'text-sm line-clamp-2'}`}>
        {project.description}
      </p>
    </a>
  );
}

export default function ProjectPromotion({ 
  className, 
  maxProjects 
}: ProjectPromotionProps) {
  const primaryProject = getPrimaryProject();
  
  if (!primaryProject) {
    return null;
  }
  
  return (
    <div className={cn("mt-12 pt-8 border-t border-border max-w-4xl mx-auto", className)}>
      <h2 className="text-2xl font-semibold mb-6 text-primary">
        Our Projects
      </h2>
      <p className="text-text-secondary mb-6">
        We also have other projects that might be helpful to you:
      </p>
      <div className="max-w-2xl">
        <ProjectCard project={primaryProject} isPrimary={true} />
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/about#our-projects"
          className="text-accent hover:text-accent-light font-medium"
        >
          View all projects →
        </Link>
      </div>
    </div>
  );
}
