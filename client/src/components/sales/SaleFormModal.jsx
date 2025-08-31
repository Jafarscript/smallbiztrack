import { useState, useEffect } from "react";
import api from "../../lib/axios";

const PAYMENT_METHODS = ["cash", "transfer", "pos", "other"];


const SaleFormModal = ({ mode = "add", sale = null, products = [], onClose, onSuccess }) => {
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    customerName: "",
    paymentMethod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form if editing
  useEffect(() => {
    if (mode === "edit" && sale) {
      setForm({
        productId: sale.product?._id || "",
        quantity: sale.quantity,
        customerName: sale.customerName || "",
        paymentMethod: sale.paymentMethod || "",
      });
    }
  }, [mode, sale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.paymentMethod) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "add") {
        await api.post("/sales", form);
      } else {
        await api.put(`/sales/${sale._id}`, form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {mode === "add" ? "Record New Sale" : "Edit Sale"}
        </h3>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
            >
              <option value="">Select a Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
            />
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
            >
              <option value="">Select a Method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 hover:bg-blue-700"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                ? "Add Sale"
                : "Update Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleFormModal;
