import Link from "next/link";
import { getAllCategories, getSubcategoriesByCategory } from "@/lib/content";
import NativeBanner from "@/components/ads/NativeBanner";
import { isAdPositionEnabled, adConfig } from "@/config/ads";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  alternates: { canonical: 'https://physicsexplained.org/categories' },
  title: 'Categories | Physics Explained',
  description: 'Browse all physics categories and topics',
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">All Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const subcategories = getSubcategoriesByCategory(category.slug);
          
          return (
            <div
              key={category.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border"
            >
              {/* 1级分类标题和描述 */}
              <Link href={`/categories/${category.slug}`}>
                <h2 className="text-2xl font-semibold mb-2 text-primary hover:text-accent transition-colors">
                  {category.name}
                </h2>
              </Link>
              <p className="text-text-secondary mb-4">
                {category.description}
              </p>

              {/* 子分类列表 */}
              {subcategories.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                    Subcategories
                  </h3>
                  <div className="space-y-2">
                    {subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/categories/${category.slug}/${subcategory.slug}`}
                        className="block p-3 rounded-md bg-surface hover:bg-accent/10 hover:border-accent border border-transparent transition-all duration-200 group"
                      >
                        <h4 className="text-base font-medium text-primary group-hover:text-accent transition-colors">
                          {subcategory.name}
                        </h4>
                        {subcategory.description && (
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {subcategory.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 如果没有子分类，显示查看所有文章链接 */}
              {subcategories.length === 0 && (
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-block mt-4 text-sm text-accent hover:text-accent-light font-medium"
                >
                  View all topics →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* 广告位置：分类列表之后 */}
      {isAdPositionEnabled('categoryListAfterList') && (
        <NativeBanner
          containerId={adConfig.nativeBanner.containerId}
          scriptSrc={adConfig.nativeBanner.scriptSrc}
          maxWidth="max-w-6xl"
        />
      )}
    </div>
  );
}

