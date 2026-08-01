import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/content";
import { getArticlesBySubcategory } from "@/lib/content";
import NativeBanner from "@/components/ads/NativeBanner";
import { isAdPositionEnabled, adConfig } from "@/config/ads";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const categoryData = getCategoryBySlug(category);
  const subcategoryData = getSubcategoryBySlug(category, subcategory);
  const articles = await getArticlesBySubcategory(category, subcategory);

  if (!categoryData || !subcategoryData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-4">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${category}`} className="hover:text-accent">
          {categoryData.name}
        </Link>
        <span className="mx-2">/</span>
        <span>{subcategoryData.name}</span>
      </nav>

      {/* Subcategory Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          {subcategoryData.name}
        </h1>
        <p className="text-lg text-text-secondary">
          {subcategoryData.description}
        </p>
      </div>

      {/* Articles List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Topics</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
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
                <span className="text-sm text-accent">Read more →</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary">No topics yet in this subcategory.</p>
        )}
      </div>

      {/* 广告位置：文章列表之后 */}
      {isAdPositionEnabled('subcategoryAfterList') && (
        <NativeBanner
          containerId={adConfig.nativeBanner.containerId}
          scriptSrc={adConfig.nativeBanner.scriptSrc}
          maxWidth="max-w-6xl"
        />
      )}
    </div>
  );
}

