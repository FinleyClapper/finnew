from flask import Flask, jsonify, request,session
from flask_cors import CORS
import finnhub
from datetime import date, timedelta
API_KEY = 'd4mut9hr01qsn6g8idv0d4mut9hr01qsn6g8idvg'
client = finnhub.Client(api_key=API_KEY)
app = Flask(__name__)
CORS(app, supports_credentials=True)
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
    # Ensure value is a float or int
    value = value * 1000000
    if not value or value == 0:
        return "N/A"
    
    # Trillions
    if value >= 1_000_000_000_000:
        return f"{value / 1_000_000_000_000:.2f}T"
    
    # Billions
    elif value >= 1_000_000_000:
        return f"{value / 1_000_000_000:.2f}B"
    
    # Millions
    elif value >= 1_000_000:
        return f"{value / 1_000_000:.2f}M"
    
    # Return as-is if smaller than a million
    return str(value)
@app.route("/api/stocks/info")
def company_info():
    symbol = request.args.get("symbol","").strip()
    overview = stock_overview(symbol)
    quote = price_quote(symbol)
    profile = company_profile(symbol)
    print(profile)
    data = {'name': profile["name"],
            'price': quote['c'],
            'exchange': profile['exchange'],
            'change': price_change(quote),
            'cap': format_market_cap(profile['marketCapitalization']),
            'ratio': round(overview['metric']['peAnnual'],2),
            'high': '$' + str(round(overview['metric']['52WeekHigh'],2)),
            'volume': format_market_cap(overview['metric']['10DayAverageTradingVolume'])}
    return data
app.run(debug=True, port=5000)