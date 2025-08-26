import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";

// A reusable input component to reduce boilerplate
function FormInput({ label, name, error, children }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}




// --- THE NEW PRODUCT FORM ---
function ProductForm({ onSaved }) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [id, setId] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", price: "", quantity: "", reorderLevel: "", cost: "", sku: "", image: null });
    
    // State for validation errors and submission status
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState(""); // For general API errors

    // Event listener to open the modal
    useEffect(() => {
        const handler = (e) => {
            setMode(e.detail.mode);
            setErrors({}); // Clear previous errors
            setServerError("");
            setOpen(true);

            if (e.detail.mode === "edit") {
                const p = e.detail.product;
                setId(p._id);
                setForm({
                    name: p.name || "",
                    category: p.category || "",
                    price: p.price || "",
                    quantity: p.quantity || "",
                    reorderLevel: p.reorderLevel || "",
                    cost: p.cost || "",
                    sku: p.sku || "",
                    image: null
                });
            } else {
                setId(null);
                setForm({ name: "", category: "", price: "", quantity: "", reorderLevel: "", cost: "", sku: "", image: null });
            }
        };
        window.addEventListener("open-product-form", handler);
        return () => window.removeEventListener("open-product-form", handler);
    }, []);
    
    // Generic onChange handler
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        // Clear the error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
        
        if (type === 'file') {
            setForm(prev => ({...prev, [name]: files?.[0] || null}));
        } else {
            setForm(prev => ({...prev, [name]: value}));
        }
    };
    
    // Client-side validation
    const validateForm = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = "Name is required.";
        if (!form.category) newErrors.category = "Category is required.";
        if (!form.price || parseFloat(form.price) <= 0) newErrors.price = "Price must be a positive number.";
        if (form.quantity === "" || parseInt(form.quantity) < 0) newErrors.quantity = "Quantity is required and cannot be negative.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function submit() {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setServerError("");
        
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k === "image" && !v) return; // Don't append null image
            if (v !== null && v !== "") fd.append(k, v);
        });

        try {
            if (mode === "create") {
                await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await api.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            }
            setOpen(false);
            onSaved?.(); // Refresh the product list
        } catch (error) {
            const errData = error.response?.data;
            if (error.response?.status === 422 && errData.errors) {
                // Handle validation errors from the backend
                setErrors(errData.errors);
            } else {
                // Handle other errors (e.g., duplicate product name, server error)
                setServerError(errData?.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-xl font-semibold">{mode === "create" ? "Add New Product" : "Edit Product"}</h2>
                
                {serverError && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{serverError}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Name *" name="name" error={errors.name}>
                        <input name="name" className={`border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Coca-Cola" value={form.name} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Category *" name="category" error={errors.category}>
                        <input name="category" className={`border rounded px-3 py-2 ${errors.category ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Drinks" value={form.category} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Selling Price *" name="price" error={errors.price}>
                        <input name="price" className={`border rounded px-3 py-2 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} type="number" step="0.01" placeholder="150.00" value={form.price} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Quantity *" name="quantity" error={errors.quantity}>
                        <input name="quantity" className={`border rounded px-3 py-2 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`} type="number" placeholder="50" value={form.quantity} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Reorder Level" name="reorderLevel" error={errors.reorderLevel}>
                        <input name="reorderLevel" className={`border rounded px-3 py-2 ${errors.reorderLevel ? 'border-red-500' : 'border-gray-300'}`} type="number" placeholder="10" value={form.reorderLevel} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Cost (Optional)" name="cost" error={errors.cost}>
                        <input name="cost" className={`border rounded px-3 py-2 ${errors.cost ? 'border-red-500' : 'border-gray-300'}`} type="number" step="0.01" placeholder="120.00" value={form.cost} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="SKU (Optional)" name="sku" error={errors.sku}>
                        <input name="sku" className={`border rounded px-3 py-2 ${errors.sku ? 'border-red-500' : 'border-gray-300'}`} placeholder="SKU001" value={form.sku} onChange={handleChange} />
                    </FormInput>
                    <FormInput label="Image" name="image" error={errors.image}>
                        <input name="image" className={`border rounded px-3 py-2 text-sm ${errors.image ? 'border-red-500' : 'border-gray-300'}`} type="file" accept="image/*" onChange={handleChange} />
                    </FormInput>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-100" onClick={() => setOpen(false)}>Cancel</button>
                    <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300" 
                        onClick={submit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : (mode === "create" ? "Create" : "Save Changes")}
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- MAIN PRODUCTS PAGE (Mostly unchanged, but with a better onSaved handler) ---
export default function Products() {
    const [q, setQ] = useState({ search: "", category: "", sort: "createdAt", order: "desc", page: 1, limit: 10 });
    const [resp, setResp] = useState({ data: [], total: 0, totalPages: 1, page: 1 });

    const params = useMemo(() => ({ ...q }), [q]);

    async function load() {
        try {
            const { data } = await api.get("/products", { params });
            setResp(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Optionally, set an error state to show a message on the main page
        }
    }
    
    // Using a separate trigger state for reloading to avoid complex dependency arrays
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const reload = () => setReloadTrigger(t => t + 1);
    
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [params, reloadTrigger]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
                {/* Search and Filter UI (no changes) */}
                 <div className="flex gap-2">
           <input
             value={q.search}
             onChange={(e) => setQ((s) => ({ ...s, search: e.target.value, page: 1 }))}
             placeholder="Search name or category..."
             className="border border-gray-300 rounded-lg px-3 py-2"
           />
           <select
             value={q.category}
             onChange={(e) => setQ((s) => ({ ...s, category: e.target.value, page: 1 }))}
             className="border border-gray-300 rounded-lg px-3 py-2"
           >
             <option value="">All categories</option>
             <option>Drinks</option>
             <option>Food</option>
             <option>Household</option>
           </select>
           <select
             value={q.sort}
             onChange={(e) => setQ((s) => ({ ...s, sort: e.target.value }))}
             className="border border-gray-300 rounded-lg px-3 py-2"
           >
             <option value="createdAt">Newest</option>
             <option value="name">Name</option>
             <option value="price">Price</option>
             <option value="quantity">Quantity</option>
           </select>
           <select
             value={q.order}
             onChange={(e) => setQ((s) => ({ ...s, order: e.target.value }))}
             className="border border-gray-300 rounded-lg px-3 py-2"
           >
             <option value="desc">Desc</option>
             <option value="asc">Asc</option>
           </select>
         </div>

                <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-product-form", { detail: { mode: "create" } }))}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Add Product
                </button>
            </div>

            {/* Table and Pagination UI (no changes) */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
       <table className="min-w-full">
         <thead className="bg-gray-50">
           <tr>
             <th className="px-4 py-3 text-left">Image</th>
             <th className="px-4 py-3 text-left">Name</th>
             <th className="px-4 py-3 text-left">Category</th>
             <th className="px-4 py-3 text-left">Price</th>
             <th className="px-4 py-3 text-left">Qty</th>
             <th className="px-4 py-3"></th>
           </tr>
         </thead>
         <tbody className="divide-y">
           {resp.data.map(p => (
             <tr key={p._id}>
               <td className="px-4 py-3">
                 {p.image?.url ? <img src={p.image.url} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 bg-gray-200 rounded" />}
               </td>
               <td className="px-4 py-3">{p.name}</td>
               <td className="px-4 py-3">{p.category || "-"}</td>
               <td className="px-4 py-3">{p.price}</td>
               <td className="px-4 py-3">{p.quantity}</td>
               <td className="px-4 py-3 text-right">
                 <div className="flex gap-2 justify-end">
                   <button
                     className="px-3 py-1 border rounded"
                     onClick={() => window.dispatchEvent(new CustomEvent("open-product-form", { detail: { mode: "edit", product: p } }))}
                   >Edit</button>
                   <button
                     className="px-3 py-1 border rounded text-red-600"
                     onClick={async () => {
                       if (!confirm("Delete this product?")) return;
                       await api.delete(`/products/${p._id}`);
                       reload();
                     }}
                   >Delete</button>
                 </div>
               </td>
             </tr>
           ))}
           {resp.data.length === 0 && (
             <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No products found.</td></tr>
           )}
         </tbody>
       </table>
     </div>

     <div className="flex items-center justify-between">
       <span className="text-sm text-gray-500">Page {resp.page} of {resp.totalPages}</span>
       <div className="flex gap-2">
         <button
           className="px-3 py-1 border rounded disabled:opacity-50"
           disabled={resp.page <= 1}
           onClick={() => setQ(s => ({ ...s, page: s.page - 1 }))}
         >Prev</button>
         <button
           className="px-3 py-1 border rounded disabled:opacity-50"
           disabled={resp.page >= resp.totalPages}
           onClick={() => setQ(s => ({ ...s, page: s.page + 1 }))}
         >Next</button>
       </div>
     </div>

            {/* Mount the single ProductForm instance globally */}
            <ProductForm onSaved={reload} />
        </div>
    );
}