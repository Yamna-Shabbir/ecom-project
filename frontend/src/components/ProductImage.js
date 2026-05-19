import { useState, createElement } from "react";
import { resolveImageUrl } from "../config/api";

function ProductImage({ image, alt, className, placeholderClassName = "product-card-img-placeholder" }) {
  const [broken, setBroken] = useState(false);
  const src = resolveImageUrl(image);

  if (!src || broken) {
    return createElement("motion.div".replace("motion.", ""), { className: placeholderClassName }, "🧶");
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt || ""}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

export default ProductImage;
