import axios from 'axios'
import mongoose from 'mongoose'
import Product from './models/Product.js'

const api = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json'


async function getProduct(){
    const res=await axios.get(api)
    await Product.insertMany(res.data)
    console.log("Success")
    mongoose.connection.close()
}
getProduct()