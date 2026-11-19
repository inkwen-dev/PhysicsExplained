import Link from "next/link";
import { getAllCategories } from "@/lib/content";
import { getAllArticles } from "@/lib/content";
import NativeBanner from "@/components/ads/NativeBanner";
import { isAdPositionEnabled, adConfig } from "@/config/ads";

export const metadata = { alternates: { canonical: 'https://physicsexplained.org' } };

export default async function Home() {
  const categories = getAllCategories();
  const allArticles = await getAllArticles();
  
  // 获取最新文章作为特色文章
  const featuredArticles = allArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Physics Explained</h1>
          <p className="text-xl text-gray-200 mb-2">
            Understanding Physics, Simply Explained
          </p>
          <p className="text-lg text-gray-300">
            Explore the fascinating world of physics, from everyday phenomena to the mysteries of the universe.
          </p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-primary">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {category.name}
                </h3>
                <p className="text-text-secondary text-sm">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      {featuredArticles.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-primary">Featured Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.slug}`}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border"
                >
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    {article.title}
                  </h3>
                  <p className="text-text-secondary mb-2">
                    {article.shortAnswer}
                  </p>
                  <span className="text-sm text-accent">
                    Read more →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 广告位置：Featured Topics之后 */}
      {isAdPositionEnabled('homeAfterTopics') && (
        <NativeBanner
          containerId={adConfig.nativeBanner.containerId}
          scriptSrc={adConfig.nativeBanner.scriptSrc}
          maxWidth="max-w-6xl"
        />
      )}
    </div>
  );
}

