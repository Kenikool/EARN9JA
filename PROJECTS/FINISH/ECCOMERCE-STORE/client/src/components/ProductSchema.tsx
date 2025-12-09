import { Helmet } from "react-helmet-async";
import type { Product } from "../types";

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Your Store",
    },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "USD",
      price: product.salePrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Your Store",
      },
    },
    aggregateRating: product.averageRating && product.totalReviews ? {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews,
    } : undefined,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
