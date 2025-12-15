from flask import Flask, jsonify, request,session
from flask_cors import CORS
import finnhub
from datetime import date, timedelta, datetime
from pymongo import MongoClient
API_KEY = 'd4mut9hr01qsn6g8idv0d4mut9hr01qsn6g8idvg'
client = finnhub.Client(api_key=API_KEY)
app = Flask(__name__)
CORS(app, supports_credentials=True)
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["stock_database"]
stocks_collection = db["company_info"]
@app.route("/api/stocks/symbol_search")
def stock_search():
    symbol = request.args.get("symbol","").strip()
    data = client.symbol_lookup(symbol)
    return data
@app.route("/api/market/news")
def market_news():
    data = client.general_news('general')
    return data
@app.route("/api/stocks/news")
def stock_news():
    symbol = request.args.get("symbol","").strip()
    end_date = date.today()
    start_date = end_date - timedelta(days=7)
    data = client.company_news(symbol=symbol,_from = start_date, to=end_date)
    return data
def price_quote(symbol):
    data = client.quote(symbol=symbol)
    return data
def stock_overview(symbol):
    data = client.company_basic_financials(symbol=symbol,metric='all')
    return data
def company_profile(symbol):
    data = client.company_profile2(symbol=symbol)
    return data
def price_change(quote):
    dollar_ammount = round((quote['o'] - quote['c']),2)
    da = abs(dollar_ammount)
    percent = round(quote['dp'],2)
    if(dollar_ammount >= 0):
        return f'+${da} (%{percent})'
    return f'-${da} (%{percent})'
def format_market_cap(value):
    value = value * 1000000
    if not value or value == 0:
        return "N/A"
    if value >= 1_000_000_000_000:
        return f"{value / 1_000_000_000_000:.2f}T"
    elif value >= 1_000_000_000:
        return f"{value / 1_000_000_000:.2f}B"
    elif value >= 1_000_000:
        return f"{value / 1_000_000:.2f}M"
    return str(value)
@app.route("/api/stocks/info")
@app.route("/api/stocks/info")
@app.route("/api/stocks/info")
def company_info():
    symbol = request.args.get("symbol", "").strip().upper()
    if not symbol:
        return jsonify({"error": "No symbol provided"}), 400
    existing_data = stocks_collection.find_one({"symbol": symbol})
    is_fresh = False
    if existing_data:
        updated_at = existing_data.get("updated_at")
        if updated_at and datetime.utcnow() - updated_at < timedelta(hours=1):
            is_fresh = True

    if existing_data and is_fresh:
        existing_data.pop("_id", None)
        existing_data["source"] = "database" 
        return jsonify(existing_data)
    try:
        overview = stock_overview(symbol)
        quote = price_quote(symbol)
        profile = company_profile(symbol)
        new_data = {
            'symbol': symbol,
            'name': profile.get("name"),
            'price': quote.get('c'),
            'exchange': profile.get('exchange'),
            'change': price_change(quote),
            'cap': format_market_cap(profile.get('marketCapitalization', 0)),
            'ratio': round(overview['metric'].get('peAnnual', 0), 2),
            'high': '$' + str(round(overview['metric'].get('52WeekHigh', 0), 2)),
            'volume': format_market_cap(overview['metric'].get('10DayAverageTradingVolume', 0)),
            'updated_at': datetime.utcnow()
        }
        stocks_collection.update_one(
            {"symbol": symbol},
            {"$set": new_data},
            upsert=True
        )
        new_data.pop("_id", None)
        new_data["source"] = "api"
        return jsonify(new_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/api/stocks/history")
def get_history():
    history = list(stocks_collection.find({}, {"_id": 0}))
    return jsonify(history)
app.run(debug=True, port=5000)