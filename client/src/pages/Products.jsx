import { useState } from "react";
import useApi from "../hooks/useApi";
import ProductFormModal from "../components/products/ProductFormModal";
import ProductsTable from "../components/products/ProductsTable";
import ProductsToolbar from "../components/products/ProductsToolbar";
import Pagination from "../components/ui/Pagination";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../lib/axios";

const initialQuery = {
  search: "",
  category: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
  limit: 10,
};

const ProductsPage = () => {
  // State to manage the modal's visibility, mode (create/edit), and data
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    product: null,
  });

  const {
    data: products,
    meta,
    query,
    setQuery,
    isLoading,
    error,
    reloadData,
  } = useApi("/products", initialQuery);

  // Fetch the categories from your API
  const { data: categories, isLoading: areCategoriesLoading } = useApi("/products/categories");

  const openModal = (mode = "create", product = null) => {
    setModalState({ isOpen: true, mode, product });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "create", product: null });
  };

  const handleSave = () => {
    closeModal();
    reloadData(); // Refresh the product list after saving
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      reloadData();
    } catch (err) {
      alert("Failed to delete product.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>

      <ProductsToolbar
        query={query}
        setQuery={setQuery}
        onAddProduct={() => openModal("create")}
        categories={categories || []}
        isLoadingCategories={areCategoriesLoading}
      />

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-500">Failed to load products.</p>}
      {!isLoading && !error && (
        <>
          <ProductsTable
            products={products}
            onEdit={(product) => openModal("edit", product)}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          />
        </>
      )}

      {/* The form modal is rendered conditionally */}
      {modalState.isOpen && (
        <ProductFormModal
          mode={modalState.mode}
          product={modalState.product}
          onClose={closeModal}
          onSaved={handleSave}
        />
      )}
    </div>
  );
};

export default ProductsPage;