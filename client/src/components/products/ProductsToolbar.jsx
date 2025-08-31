// Define constants for the dropdown options to keep the component clean.
// In a real app, CATEGORIES might come from an API.

const STOCK_STATUS_OPTIONS = [
  { value: "all", label: "All Stock Status" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];
const SORT_OPTIONS = [
  { value: "createdAt", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "quantity", label: "Stock Quantity" },
];

const ProductsToolbar = ({ query, setQuery, onAddProduct, categories = [], isLoadingCategories = false }) => {
  const handleFilterChange = (e) => {
    // This generic handler updates the query state for any filter
    // and resets the page to 1 for a new search.
    setQuery((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <input
          type="text"
          name="search"
          placeholder="Search by name or SKU..."
          value={query.search}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
        />

        {/* Category Filter */}
        <select
          name="category"
          value={query.category || ""}
          onChange={handleFilterChange}
          disabled={isLoadingCategories} // Disable while categories are loading
          className="border border-gray-300 rounded-md px-3 py-2 text-sm disabled:opacity-60 disabled:bg-gray-200"
        >
          <option value="">{isLoadingCategories ? "Loading..." : "All Categories"}</option>
          {/* Map over the categories from props instead of the constant */}
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        {/* Stock Status Filter */}
        <select
          name="stockStatus"
          value={query.stockStatus || "all"}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {STOCK_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Sort By */}
        <select
          name="sort"
          value={query.sort || "createdAt"}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>Sort by {opt.label}</option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          name="order"
          value={query.order || "desc"}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Add Product Button */}
      <button
        onClick={onAddProduct}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold text-sm"
      >
        + Add Product
      </button>
    </div>
  );
};

export default ProductsToolbar;