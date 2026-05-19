import { SITE_NAME, utmShopUrl } from "../constants/seo";

function link(source, medium, content) {
  return utmShopUrl({ source, medium, content });
}

/** Copy-paste posts for high-traffic platforms (parasite SEO). */
export function getParasiteTemplates() {
  const shop = link("parasite", "referral", "main");

  return [
    {
      id: "pinterest",
      platform: "Pinterest",
      icon: "📌",
      tip: "Pin product photos + link in description. Use 2–3 hashtags.",
      template: `Handmade crochet flowers & home décor from Pakistan 🌸

Slow-made pieces — perfect for gifts & cozy spaces.

Shop: ${shop}

#crochet #handmade #pakistan #homedecor #crochetflowers`,
    },
    {
      id: "medium",
      platform: "Medium",
      icon: "✍️",
      tip: "Publish as a short story or listicle; add link in first and last paragraph.",
      template: `Why Handmade Crochet Gifts Are Having a Moment in Pakistan

Fresh flowers fade. Mass-produced décor feels cold. Handmade crochet sits in the middle — personal, lasting, and made with intention.

I recently discovered ${SITE_NAME}, a small shop focused on crochet flowers, home décor, and artisan gifts. They offer cash on delivery, which makes trying something new easier.

If you are decorating a room or hunting for a thoughtful present, start here:
${shop}

What handmade piece would you add to your home?`,
    },
    {
      id: "reddit",
      platform: "Reddit",
      icon: "🔴",
      tip: "Post in r/Pakistan, r/crochet, or local gift threads — be helpful, not spammy.",
      template: `Found a small Pakistani shop doing handmade crochet (flowers + home décor). They do COD and custom-style pieces.

Link: ${shop}

Has anyone ordered handmade crochet online in PK before? Curious about quality vs price.`,
    },
    {
      id: "quora",
      platform: "Quora",
      icon: "❓",
      tip: "Answer questions like “best handmade gifts in Pakistan”.",
      template: `For unique handmade gifts in Pakistan, consider crochet flowers or artisan home décor instead of generic mall items.

${SITE_NAME} is one option — they sell handmade crochet online with cash on delivery:
${shop}

Look for clear product photos, reviews, and realistic delivery times (often 2–3 weeks for handmade).`,
    },
    {
      id: "instagram",
      platform: "Instagram",
      icon: "📸",
      tip: "Reel or carousel + link in bio using this URL in stories.",
      template: `New handmade drop 🧶✨ Crochet flowers & cozy décor — made in Pakistan.

Tap to shop (COD available):
${shop}

#Gulkaar #handmadePK #crochet #slowfashion #pakistanigifts`,
    },
    {
      id: "linkedin",
      platform: "LinkedIn",
      icon: "💼",
      tip: "Share as a founder/small-business story post.",
      template: `Building a handmade brand in Pakistan taught me one thing: people crave authenticity.

${SITE_NAME} — crochet flowers, home décor, and artisan gifts — ships with cash on delivery for buyers who prefer it.

If you support local makers, take a look:
${shop}

#SmallBusiness #Handmade #Pakistan #Ecommerce`,
    },
  ];
}

export const TARGET_KEYWORDS = [
  "crochet flowers pakistan",
  "handmade gifts pakistan cod",
  "crochet home decor pakistan",
  "artisan shop online pakistan",
  "handmade bouquet crochet",
  "slow fashion pakistan gifts",
  "gulkaar handmade",
];
