

function ProductTable({ products, isLoading, error }) {
    return (
        <div className="p-6">
            <table className="min-w-full bg-white border border-gray-200 drop-shadow-lg mb-6">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">ID</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Title</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Description</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Price</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Category</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Sold</th>
                        <th className="py-3 px-6 font-semibold text-gray-600 border-b">Image</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="7" className="py-3 px-6 text-center">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="7" className="py-3 px-6 text-center text-red-500">{error}</td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="py-3 px-6 text-center">No products found</td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="py-3 px-6 border-b">{product.id}</td>
                                <td className="py-3 px-6 border-b">{product.title}</td>
                                <td className="py-3 px-6 border-b">{product.description}</td>
                                <td className="py-3 px-6 border-b">{product.price}</td>
                                <td className="py-3 px-6 border-b">{product.category}</td>
                                <td className="py-3 px-6 border-b">{product.sold ? 'Yes' : 'No'}</td>
                                <td className="py-3 px-6 border-b">
                                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover" />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductTable;
