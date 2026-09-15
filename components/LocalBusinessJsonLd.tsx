import { brands } from '@/lib/data/brands';
import { categories } from '@/lib/data/categories';
import { fullAddress, site } from '@/lib/data/site';

/** LocalBusiness structured data for the homepage. */
export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeGoodsStore',
    '@id': `${site.url}/#showroom`,
    name: site.name,
    description: `${site.tagline} in ${site.address.city}, stocking designer tiles, sanitaryware, faucets, wash basins and large-format slabs since ${site.established}.`,
    url: site.url,
    telephone: site.phone.display,
    email: site.email,
    foundingDate: String(site.established),
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    areaServed: ['Ghaziabad', 'Noida', 'Delhi NCR', 'Uttar Pradesh'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${site.name}, ${fullAddress}`,
    )}`,
    openingHoursSpecification: site.openingHoursSpec.map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: entry.days,
      opens: entry.opens,
      closes: entry.closes,
    })),
    brand: brands.map((brand) => ({ '@type': 'Brand', name: brand.name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Product categories',
      itemListElement: categories.map((category) => ({
        '@type': 'OfferCatalog',
        name: category.title,
        description: category.description,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Values come from our own data files, not from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
