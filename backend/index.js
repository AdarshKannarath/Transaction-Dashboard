import express from 'express';
import Product from './models/Product.js';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from 'dotenv';
const app = express();
app.use(cors({
  origin:["https://transaction-dashboard-tn2r.vercel.app/"],
        methods:["GET","POST", "PUT", "DELETE"],
        credentials:true
}));
dotenv.config();
mongoose.connect(process.env.MONGO_URL);

const monthMap = {
  'january': 0,
  'february': 1,
  'march': 2,
  'april': 3,
  'may': 4,
  'june': 5,
  'july': 6,
  'august': 7,
  'september': 8,
  'october': 9,
  'november': 10,
  'december': 11
};

app.get('/', async (req, res) => {
  res.send('Welcome');
});

app.get('/transactions', async (req, res) => {
    try {
        const { month, search = '', page = 1, perPage = 7 } = req.query;
       
        if (!month) {
            return res.status(400).json({ error: ' month is required.' });
        }

        // Map month name to month number
        const monthNum = monthMap[month.toLowerCase()];
        
        if (monthNum === undefined) {
            return res.status(400).json({ error: 'Invalid month. Please provide a valid month name (e.g., January, February, etc.).' });
        }

        const searchQuery = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: 'i' } },
                      { description: { $regex: search, $options: 'i' } },
                      { price: { $regex: search, $options: 'i' } }
                  ]
              }
            : {};

        const limit = parseInt(perPage);
        const skip = (parseInt(page) - 1) * limit;

        // Find transactions by month without considering the year
        const transactions = await Product.find({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum + 1] }, // monthNum is 0-indexed, MongoDB months are 1-indexed
            ...searchQuery
        })
            .skip(skip)
            .limit(limit);

            
        const totalTransactions = await Product.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum + 1] },
            ...searchQuery
        });

        res.status(200).json({
            data: transactions,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTransactions / limit),
            totalTransactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// statistics
app.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ error: 'Month is required.' });
        }

        // Map month name to month number
        const monthNum = monthMap[month.toLowerCase()];
        
        if (monthNum === undefined) {
            return res.status(400).json({ error: 'Invalid month. Please provide a valid month name (e.g., January, February, etc.).' });
        }

        // Get total sold items, total unsold items, and total sales for the selected month
        const stats = await Product.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum + 1] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSalesAmount: { $sum: "$price" },          // Sum of all prices (assuming 'price' is the sale price)
                    totalSoldItems: { $sum: { $cond: [ "$sold", 1, 0 ] } }, // Count sold items
                    totalNotSoldItems: { $sum: { $cond: [ "$sold", 0, 1 ] } } // Count unsold items
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({
                totalSalesAmount: 0,
                totalSoldItems: 0,
                totalNotSoldItems: 0
            });
        }

        const { totalSalesAmount, totalSoldItems, totalNotSoldItems } = stats[0];

        res.status(200).json({
            totalSalesAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/barchart', async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) {
            return res.status(400).json({ error: 'Month is required.' });
        }

        const monthNum = monthMap[month.toLowerCase()];
        if (monthNum === undefined) {
            return res.status(400).json({ error: 'Invalid month name.' });
        }

        // Define price ranges for the chart (e.g., 0-100, 101-200, etc.)
        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 1000 },
            { min: 1001, max: 5000 },
        ];

        const priceRangeCounts = await Promise.all(
            priceRanges.map(async (range) => {
                const count = await Product.countDocuments({
                    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum + 1] }, // Filter by month
                    price: { $gte: range.min, $lte: range.max }, // Filter by price range
                });
                return {
                    range: `${range.min}-${range.max}`,
                    count,
                };
            })
        );

        res.status(200).json(priceRangeCounts);
    } catch (error) {
        console.error('Error fetching price range data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Assuming you have a transaction model with category data
app.get('/piechart', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required.' });
  }

  const monthNum = monthMap[month.toLowerCase()];
  if (monthNum === undefined) {
    return res.status(400).json({ error: 'Invalid month name.' });
  }

  try {
    const data = await Product.aggregate([
      {
        $match: {   
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }  // Remove the +1
        }
      },
      {
        $group: {
          _id: "$category",
          totalSales: { $sum: "$price" },  // Group by category and sum sales
        }
      },
      {
        $sort: { totalSales: -1 }  // Optional: Sort by totalSales descending
      }
    ]);

    if (data.length === 0) {
      return res.status(404).json({ error: 'No sales data found for the given month.' });
    }

    const responseData = data.map(item => ({
      range: item._id,         // Change _id to "range" for categories
      count: item.totalSales,  // Change totalSales to "count" for sales amount
    }));

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




app.listen(3000, () => {
  console.log("Started server");
});
