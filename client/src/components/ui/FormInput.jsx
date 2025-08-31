function FormInput({ label, name, error, children }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}

export default FormInput;