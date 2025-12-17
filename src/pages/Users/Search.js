import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "../../css/Customercss/Search.css";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchParams({ q: searchTerm });

    try {
      const res = await API.get(
        `/product/search?q=${encodeURIComponent(searchTerm)}`
      );
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []);

  return (
    <div className="search-page">
      <h2>Search Products</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="search-results">
        {results.length > 0 ? (
          results.map((prod) => {
            const imageUrl = prod.images?.[0];
            const price = prod.variants?.[0]?.sizes?.[0]?.price || 0;
            const discount = prod.discount || 0;

            const finalPrice = discount
              ? (price - (price * discount) / 100).toFixed(2)
              : price;

            return (
              <div
                key={prod._id}
                className="search-item"
                onClick={() => navigate(`/productdetail/${prod._id}`)}
              >
                {imageUrl && (
                  <img
                    src={`http://localhost:5000/${imageUrl}`}
                    alt={prod.name}
                  />
                )}

                <h4>{prod.name}</h4>

                {discount > 0 ? (
                  <p>
                    <span className="discounted-price">₹{finalPrice}</span>
                    <span className="original-price">₹{price}</span>
                  </p>
                ) : (
                  <p>₹{price}</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="no-results">No products found</p>
        )}
      </div>
    </div>
  );
}
