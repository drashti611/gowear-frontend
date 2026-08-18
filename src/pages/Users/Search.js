import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaSearch, FaBoxOpen } from "react-icons/fa";
import API from "../../api/axios";
import getImageUrl from "../../utils/imageUrl";
import "../../css/Customercss/Search.css";
import "../../css/Customercss/ProductByCategoryScreen.css";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchParams({ q: searchTerm });
    setLoading(true);
    try {
      const res = await API.get(`/product/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="search-page-wrapper container">
      <div className="search-hero-box">
        <h2 className="font-editorial" style={{ fontSize: "36px", color: "var(--gold-primary)", marginBottom: "12px" }}>
          Search The Atelier Archive
        </h2>
        <p className="text-muted" style={{ fontSize: "14px", marginBottom: "28px" }}>
          Find high-fashion silhouettes, streetwear collections, and luxury accessories.
        </p>

        <form onSubmit={handleSearch} className="search-form-noir">
          <input
            type="text"
            placeholder="Search jackets, boots, silk shirts, accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <FaSearch className="me-1" /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Searching archive...</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="mb-4 d-flex justify-content-between align-items-center" style={{ fontSize: "14px", color: "var(--text-dim)" }}>
            <span>
              Found <strong className="text-gold">{results.length}</strong> styles matching "{searchTerm}"
            </span>
          </div>

          <div className="luxury-products-grid">
            {results.map((prod) => {
              const imageUrl = prod.images?.[0];
              const price = prod.variants?.[0]?.sizes?.[0]?.price || 0;
              const discount = prod.discount || 0;
              const finalPrice = discount
                ? (price - (price * discount) / 100).toFixed(2)
                : price;

              return (
                <div
                  key={prod._id}
                  className="luxury-product-card"
                  onClick={() => navigate(`/productdetail/${prod._id}`)}
                >
                  <div className="product-image-container">
                    <img
                      src={getImageUrl(imageUrl)}
                      alt={prod.name}
                      className="product-card-img"
                    />
                    {discount > 0 && (
                      <div className="product-card-badges">
                        <span className="badge-pill-discount">-{discount}% OFF</span>
                      </div>
                    )}
                  </div>

                  <div className="product-card-body">
                    {prod.brandId?.name && (
                      <div className="product-card-brand">{prod.brandId.name}</div>
                    )}
                    <h4 className="product-card-title">{prod.name}</h4>

                    <div className="product-card-price-row mt-auto">
                      <span className="product-price-current">₹{Number(finalPrice).toLocaleString()}</span>
                      {discount > 0 && (
                        <span className="product-price-original">₹{price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : searchTerm.trim() ? (
        <div className="glass-noir text-center py-5 p-4 my-4">
          <FaBoxOpen size={48} className="text-gold mb-3" />
          <h4 style={{ color: "#ffffff" }}>No Pieces Found</h4>
          <p className="text-muted">We couldn't find any items matching "{searchTerm}". Try a different keyword.</p>
        </div>
      ) : null}
    </div>
  );
}
