const PAYMENT_METHODS = ["Cash", "Transfer", "POS", "Other"];
const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "totalPrice", label: "Total Price" },
  { value: "quantity", label: "Quantity" },
  { value: "customerName", label: "Customer" },
];

const SalesToolbar = ({ query, setQuery, onAddSale }) => {
  const handleFilterChange = (e) => {
    // Reset to page 1 whenever a filter changes
    setQuery((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          name="search"
          placeholder="Search customer or product..."
          value={query.search}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
        />
        <select name="paymentMethod" value={query.paymentMethod} onChange={handleFilterChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method.toLowerCase()}>{method}</option>
          ))}
        </select>
        <select name="sort" value={query.sort} onChange={handleFilterChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select name="order" value={query.order} onChange={handleFilterChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <button onClick={onAddSale} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold text-sm">
        + Add Sale
      </button>
    </div>
  );
};

export default SalesToolbar;