import { useState } from "react";
import useApi from "../hooks/useApi"; // A custom hook for fetching data
import SalesTable from "../components/sales/SalesTable";
import SalesToolbar from "../components/sales/SalesToolbar";
import Pagination from "../components/ui/Pagination";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../lib/axios";
import SaleFormModal from "../components/sales/SaleFormModal";

// Base query parameters for fetching sales data
const initialQuery = {
  search: "",
  paymentMethod: "",
  sort: "date",
  order: "desc",
  page: 1,
  limit: 10,
};

const SalesPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  // Use a custom hook to handle API calls, state, and query parameters
  const {
    data: sales,
    meta,
    query,
    setQuery,
    isLoading,
    error,
    reloadData,
  } = useApi("/sales", initialQuery);

  const { data: products } = useApi("/products?limit=1000"); // Fetch all products for the dropdown

  const handleDelete = async (saleId) => {
    if (!confirm("Are you sure you want to delete this sale?")) return;
    try {
      // Assuming 'api.delete' is configured in your axios instance
      await api.delete(`/sales/${saleId}`);
      reloadData(); // Refresh the sales list
    } catch (err) {
      alert("Failed to delete sale.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Sales Management</h2>

      {/* Toolbar for filters and add button */}
      <SalesToolbar
        query={query}
        setQuery={setQuery}
        onAddSale={() => setIsAddOpen(true)}
      />

      {/* Conditional rendering for loading, error, and data states */}
      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-center text-red-500">Failed to load sales data.</p>
      )}
      {!isLoading && !error && (
        <>
          <SalesTable
            sales={sales}
            onDelete={handleDelete}
            onEdit={setEditingSale}
          />
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          />
        </>
      )}

      {/* The modal for adding a new sale */}
      {/* Add Modal */}
      {isAddOpen && (
        <SaleFormModal
          mode="add"
          products={products || []}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            reloadData();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingSale && (
        <SaleFormModal
          mode="edit"
          sale={editingSale}
          products={products || []}
          onClose={() => setEditingSale(null)}
          onSuccess={() => {
            setEditingSale(null);
            reloadData();
          }}
        />
      )}
    </div>
  );
};

export default SalesPage;
