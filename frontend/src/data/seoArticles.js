/** Public SEO landing pages (indexable guides that link back to the shop). */
export const SEO_ARTICLES = [
  {
    slug: "crochet-flowers-pakistan",
    title: "Crochet Flowers in Pakistan — Handmade Bouquets & Gifts",
    description:
      "Discover handmade crochet flowers in Pakistan. Perfect for home décor, weddings, and thoughtful gifts. Shop Gülkaar with cash on delivery.",
    keywords:
      "crochet flowers pakistan, handmade flowers, crochet bouquet, artisan gifts pakistan, gulkaar",
    sections: [
      "Handmade crochet flowers are a lasting alternative to fresh blooms — no wilting, no pollen, and every petal is stitched by hand.",
      "In Pakistan, crochet flowers are popular for room décor, gift hampers, and small business packaging. They add warmth without high maintenance.",
      "At Gülkaar, each piece is made slowly with cotton yarn and careful finishing. Browse crochet flowers, home décor, and seasonal collections.",
    ],
  },
  {
    slug: "handmade-home-decor-pakistan",
    title: "Handmade Home Décor in Pakistan — Crochet & Artisan Pieces",
    description:
      "Elevate your space with handmade home décor from Pakistan. Crochet accents, soft textures, and artisan details from Gülkaar.",
    keywords:
      "handmade home decor pakistan, crochet decor, artisan home accessories, handmade shop pakistan",
    sections: [
      "Handmade décor brings personality to minimal spaces — especially crochet cushions, wall hangings, and table accents.",
      "When you buy artisan home décor locally, you support slow fashion and small-batch makers instead of mass-produced imports.",
      "Gülkaar focuses on crochet home décor and gift-ready pieces shipped across Pakistan with cash on delivery.",
    ],
  },
  {
    slug: "handmade-gifts-cash-on-delivery",
    title: "Handmade Gifts with Cash on Delivery — Shop Gülkaar",
    description:
      "Order handmade crochet gifts in Pakistan with cash on delivery. Unique presents for birthdays, Eid, and housewarmings.",
    keywords:
      "handmade gifts pakistan, cash on delivery gifts, crochet gifts, unique presents pakistan",
    sections: [
      "Looking for a gift that feels personal? Handmade crochet items stand out from generic store-bought options.",
      "Cash on delivery makes it easy to order online without upfront card payment — ideal for many buyers in Pakistan.",
      "Create an account on Gülkaar, add items to your cart, and checkout with COD. Delivery typically takes 2–3 weeks for custom work.",
    ],
  },
];

export function getArticleBySlug(slug) {
  return SEO_ARTICLES.find((a) => a.slug === slug);
}
