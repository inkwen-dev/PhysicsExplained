import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllCategories, getCategoryBySlug, getSubcategoriesByCategory } from "@/lib/content";
import { getArticlesByCategory } from "@/lib/content";
import NativeBanner from "@/components/ads/NativeBanner";
import { isAdPositionEnabled, adConfig } from "@/config/ads";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  return { alternates: { canonical: `https://physicsexplained.org/categories/${category}` } };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);
  const subcategories = getSubcategoriesByCategory(category);
  const articles = await getArticlesByCategory(category);

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-4">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="mx-2">/</span>
        <span>{categoryData.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          {categoryData.name}
        </h1>
        <p className="text-lg text-text-secondary mb-6">
          {categoryData.description}
        </p>
      </div>

      {/* Subcategories Navigation */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${category}/${subcategory.slug}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border border-border"
              >
                <h3 className="text-lg font-semibold mb-2 text-primary">
                  {subcategory.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {subcategory.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          <p className="text-text-secondary">No topics yet in this category.</p>
        )}
      </div>

      {/* 广告位置：文章列表之后 */}
      {isAdPositionEnabled('categoryAfterList') && (
        <NativeBanner
          containerId={adConfig.nativeBanner.containerId}
          scriptSrc={adConfig.nativeBanner.scriptSrc}
          maxWidth="max-w-6xl"
        />
      )}
    </div>
  );
}

