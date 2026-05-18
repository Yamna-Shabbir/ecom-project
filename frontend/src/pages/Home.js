import { Link } from "react-router-dom";
import logo from "../logo.jpeg";
import SeoHead from "../components/SeoHead";

function Home() {
  const name = localStorage.getItem("name");

  return (
    <>
      <SeoHead
        title="Gulkaar | Handmade E-Commerce Store"
        description="Shop handmade crochet and artisan items from Gulkaar."
        keywords="handmade store,crochet,artisan products,gulkaar"
      />
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag">Handmade with love</div>
          <h1>
            Crafted for<br />
            <em>those who</em><br />
            cherish warmth
          </h1>
          <p>
            Every piece in our collection is lovingly hand-crocheted — slow
            fashion that lasts a lifetime. Welcome{name ? `, ${name}` : ""}.
          </p>
          <div className="hero-buttons">
            <Link to="/shop">
              <button className="btn-primary">Shop Collection</button>
            </Link>
            <a href="#about">
              <button className="btn-outline">Our Story</button>
            </a>
          </div>
        </div>
        <div className="hero-logo-wrap">
          <img src={logo} alt="Gülkaar" className="hero-logo-img" />
        </div>
      </div>

      <div className="page" id="about">
        <div className="divider"><span>🌸</span></div>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 300, fontStyle: "italic", color: "var(--brown)", marginBottom: 16 }}>
            About Gülkaar
          </h2>
          <p style={{ color: "var(--text-light)", lineHeight: 1.9, fontSize: "0.95rem" }}>
            Gülkaar — meaning "one who works with flowers" — began as a small
            passion project and grew into a labour of love. Each stitch tells a
            story. Each item is made by hand, wrapped with care, and shipped to
            you with warmth.
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;