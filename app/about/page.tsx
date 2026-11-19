import Banner from '@/components/ads/Banner';
import { getAllProjects } from '@/config/projects';
import SupportSection from '@/components/article/SupportSection';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  alternates: { canonical: 'https://physicsexplained.org/about' },
  title: 'About | Physics Explained',
  description: 'Learn about Physics Explained and our mission',
};

export default function AboutPage() {
  // About 页面显示所有项目（包括 featured: false 的项目）
  // 文章页面只显示 featured: true 的项目（通过 ProjectPromotion 组件）
  const projects = getAllProjects();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-primary">About</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Physics Explained</h2>
        <p className="text-text-secondary mb-4">
          Physics Explained is a content website dedicated to exploring physics phenomena,
          principles, and how the universe works. We aim to explain complex physics topics
          in simple, accessible language.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 text-primary mt-8">Our Mission</h2>
        <p className="text-text-secondary mb-4">
          Our mission is to make physics accessible to everyone. We believe that understanding
          the fundamental laws of the universe is key to scientific literacy and inspiring curiosity.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 text-primary mt-8">Our Approach</h2>
        <p className="text-text-secondary mb-4">
          We use a question-and-answer format to explore topics about physics.
          Each article provides a clear, concise answer followed by a detailed explanation
          based on scientific principles and evidence.
        </p>
      </div>

      {/* Operating Costs section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          Operating Costs
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-text-secondary mb-4">
            To keep PhysicsExplained.org running and continue creating quality content,
            we incur various costs:
          </p>
          <ul className="text-text-secondary mb-4">
            <li>Server and hosting costs</li>
            <li>Content creation and research time</li>
            <li>Website maintenance and updates</li>
          </ul>
        </div>
      </section>

      {/* How to Support Us section */}
      <section id="support" className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          How to Support Us
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-text-secondary mb-4">
            If you find our content helpful, you can support us by:
          </p>
        </div>
        {/* Reuse SupportSection component with inline variant - outside prose container to avoid style conflicts */}
        <SupportSection variant="inline" />
      </section>

      {/* Our Other Projects section */}
      <section id="our-projects" className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          Our Other Projects
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-text-secondary mb-4">
            Besides PhysicsExplained.org, we also operate other projects:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all duration-200 group bg-surface/50 hover:bg-surface"
              >
                <h3 className="text-lg font-semibold text-primary group-hover:text-accent mb-2 transition-colors">
                  {project.name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Banner position="middle" />
    </div>
  );
}
