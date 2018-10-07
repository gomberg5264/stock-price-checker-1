const mongoose = require("mongoose")

const tickerSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  ip_addresses: [String],
  likes: { type: Number, default: 0},
})

const Ticker = mongoose.model("Ticker", tickerSchema, "tickers")

module.exports = Ticker