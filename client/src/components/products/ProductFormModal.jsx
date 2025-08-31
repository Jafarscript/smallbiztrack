import { useEffect, useState } from "react";
import api from "../../lib/axios";
import FormInput from "../ui/FormInput"; // Assuming you have this reusable component

const ProductFormModal = ({ mode, product, onClose, onSaved }) => {
  const initialFormState = {
    name: "",
    category: "",
    price: "",
    quantity: "",
    reorderLevel: "",
    cost: "",
    sku: "",
    image: null,
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        quantity: product.quantity || "",
        reorderLevel: product.reorderLevel || "",
        cost: product.cost || "",
        sku: product.sku || "",
        image: null, // Image is always reset
      });
    } else {
      setForm(initialFormState);
    }
    // Clear errors when modal opens or changes mode
    setErrors({});
    setServerError("");
  }, [mode, product]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    // Clear the error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.category.trim()) newErrors.category = "Category is required.";
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = "Price must be a positive number.";
    if (form.quantity === "" || parseInt(form.quantity, 10) < 0) newErrors.quantity = "Quantity must be 0 or more.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError("");

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        fd.append(key, value);
      }
    });

    try {
      if (mode === "create") {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.put(`/products/${product._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onSaved(); // This calls the parent to close modal and reload data
    } catch (error) {
      const errData = error.response?.data;
      if (error.response?.status === 422 && errData.errors) {
        // Handle validation errors from the backend
        setErrors(errData.errors);
      } else {
        // Handle other errors (e.g., duplicate product, server error)
        setServerError(errData?.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold">{mode === "create" ? "Add New Product" : "Edit Product"}</h2>
        
        {serverError && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{serverError}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Name *" name="name" error={errors.name}>
            <input name="name" className={`border rounded px-3 py-2 w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Coca-Cola" value={form.name} onChange={handleChange} />
          </FormInput>
          <FormInput label="Category *" name="category" error={errors.category}>
            <input name="category" className={`border rounded px-3 py-2 w-full ${errors.category ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Drinks" value={form.category} onChange={handleChange} />
          </FormInput>
          <FormInput label="Selling Price *" name="price" error={errors.price}>
            <input name="price" type="number" step="0.01" className={`border rounded px-3 py-2 w-full ${errors.price ? 'border-red-500' : 'border-gray-300'}`} placeholder="150.00" value={form.price} onChange={handleChange} />
          </FormInput>
          <FormInput label="Stock Quantity *" name="quantity" error={errors.quantity}>
            <input name="quantity" type="number" className={`border rounded px-3 py-2 w-full ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`} placeholder="50" value={form.quantity} onChange={handleChange} />
          </FormInput>
          <FormInput label="Reorder Level" name="reorderLevel" error={errors.reorderLevel}>
            <input name="reorderLevel" type="number" className={`border rounded px-3 py-2 w-full ${errors.reorderLevel ? 'border-red-500' : 'border-gray-300'}`} placeholder="10" value={form.reorderLevel} onChange={handleChange} />
          </FormInput>
           <FormInput label="Cost Price" name="cost" error={errors.cost}>
            <input name="cost" type="number" step="0.01" className={`border rounded px-3 py-2 w-full ${errors.cost ? 'border-red-500' : 'border-gray-300'}`} placeholder="120.00" value={form.cost} onChange={handleChange} />
          </FormInput>
          <FormInput label="SKU (Optional)" name="sku" error={errors.sku}>
            <input name="sku" className={`border rounded px-3 py-2 w-full ${errors.sku ? 'border-red-500' : 'border-gray-300'}`} placeholder="SKU001" value={form.sku} onChange={handleChange} />
          </FormInput>
          <FormInput label="Product Image" name="image" error={errors.image}>
            <input name="image" type="file" accept="image/*" className={`border rounded px-3 py-1.5 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.image ? 'border-red-500' : 'border-gray-300'}`} onChange={handleChange} />
          </FormInput>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" className="px-4 py-2 border rounded-lg hover:bg-gray-100" onClick={onClose}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 hover:bg-blue-700">
            {isSubmitting ? "Saving..." : (mode === "create" ? "Create Product" : "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;