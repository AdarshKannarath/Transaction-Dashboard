
const SearchAndDropdown = ({
    searchInput,
    setSearchInput,
    handleSearch,
    month,
    setMonth,
    setPage,
    months
}) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                {/* Search Input */}
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="border px-4 py-2 w-64 rounded-lg shadow-lg"
                    />
                    <button
                        onClick={handleSearch}
                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg"
                    >
                        Search
                    </button>
                </div>

                {/* Month Dropdown */}
                <div className="ml-4 shadow-lg">
                    <select
                        value={month}
                        onChange={(e) => {
                            setMonth(e.target.value.toLowerCase());
                            setPage(1);
                        }}
                        className="border px-4 py-2 rounded-lg w-64"
                    >
                        {months.map((m, index) => (
                            <option key={index} value={m.toLowerCase()}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchAndDropdown;
