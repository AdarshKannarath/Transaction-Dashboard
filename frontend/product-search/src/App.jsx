import { useEffect, useState } from "react";
import axios from "axios";
import StyledBarChart from "./components/StyledBarChart";
import StyledPieChart from "./components/StyledPieChart";
import SearchAndDropdown from "./components/SearchAndDropdown";
import ProductTable from "./components/ProductTable";

function App() {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [month, setMonth] = useState("march");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [pieChartError, setPieChartError] = useState(null);
  const [stats, setStats] = useState({
    totalSalesAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  axios.defaults.withCredentials=true
  const months = [
    "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October",
    "November", "December",
  ];

  const perPage = 7;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `https://transaction-dashboard-tn2r.vercel.app/transactions?month=${month}&search=${searchQuery}&page=${page}&perPage=${perPage}`
        );
        setProducts(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Error fetching the data:", error);
        setError("Failed to fetch products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, month, page]);


  useEffect(() => {
    // Filter products when search query or products change
    if (searchQuery) {
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`https://transaction-dashboard-tn2r.vercel.app/statistics?month=${month}`);
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, [month]);

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const res = await axios.get(`https://transaction-dashboard-tn2r.vercel.app/barchart?month=${month}`);
        setChartData(res.data);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };

    fetchBarChartData();
  }, [month]);

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const res = await axios.get(`https://transaction-dashboard-tn2r.vercel.app/piechart?month=${month}`);
        if (res.data && res.data.length > 0) {
          setPieChartData(res.data);
          setPieChartError(null);
        } else {
          setPieChartData([]);
          setPieChartError("No data available for the selected month.");
        }
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
        setPieChartError(error.response ? error.response.data.error : error.message);
      }
    };

    fetchPieChartData();
  }, [month]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1)
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mx-auto bg-[#EDF6F6]">
      <div className="flex items-center justify-center">
        <div className="bg-white rounded-full p-10 m-2 text-center">
          <h1 className="text-3xl font-bold">Transaction</h1>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </div>

      {/* Search and Dropdown */}
      <SearchAndDropdown
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        month={month}
        setMonth={setMonth}
        setPage={setPage}
        months={months}
      />


      {/* Product Table */}
      <ProductTable
        products={filteredProducts}  // Pass the filtered products
        isLoading={isLoading}
        error={error}
      />


      

      {/* Pagination */}
      <div className="flex justify-between mt-4 items-center">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || totalPages === 1}
          className={`px-4 py-2 rounded ${page === 1 || totalPages === 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
        >
          Previous
        </button>

        <div className="flex justify-center">
          {Array.from({ length: totalPages }, (_, index) => {
            const showPage =
              index + 1 === 1 ||
              index + 1 === totalPages ||
              (index + 1 >= page - 1 && index + 1 <= page + 1);

            return (
              showPage && (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`mx-1 px-3 py-1 border rounded ${page === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                >
                  {index + 1}
                </button>
              )
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || totalPages === 1}
          className={`px-4 py-2 rounded ${page === totalPages || totalPages === 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
        >
          Next
        </button>
      </div>



      {/* Stats Section */}
      <div className="mb-6 p-4 mt-5 bg-gray-100 rounded-lg shadow-2xl">
        <h3 className="text-xl font-bold mb-4">Monthly Statistics - {month.toUpperCase()}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Sales Amount Card */}
          <div className="bg-blue-600 p-4 rounded-lg shadow-xl flex flex-col items-center">
            <p className="text-lg font-semibold text-white">Total Sales Amount</p>
            <p className="text-2xl font-bold text-white mt-2">${stats.totalSalesAmount}</p>
          </div>

          {/* Total Sold Items Card */}
          <div className="bg-green-500 p-4 rounded-lg shadow-xl flex flex-col items-center">
            <p className="text-lg font-semibold text-white">Total Sold Items</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalSoldItems}</p>
          </div>

          {/* Total Not Sold Items Card */}
          <div className="bg-violet-500 p-4 rounded-lg shadow-xl flex flex-col items-center">
            <p className="text-lg font-semibold text-white">Total Not Sold Items</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalNotSoldItems}</p>
          </div>
        </div>
      </div>



      {/* Charts */}
      <div className="flex justify-between mt-6 space-x-4 p-6">
        <div className="w-1/2 p-4 border border-gray-300 shadow-xl rounded-lg flex items-center justify-center bg-white">
          <div className="w-4/5 flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-4 text-center">Sales Bar Chart</h3>
            <div className="w-full">
              <StyledBarChart data={chartData} />
            </div>
          </div>
        </div>

        <div className="w-1/2 p-4 border border-gray-300 shadow-2xl rounded-lg flex flex-col items-center justify-center bg-white">
          <h3 className="text-xl font-bold mb-4 text-center">Sales Pie Chart</h3>
          <div className="flex items-center justify-center h-80 w-full">
            <StyledPieChart data={pieChartData} />
          </div>
        </div>
      </div>

    </div>
  );

}

export default App;
