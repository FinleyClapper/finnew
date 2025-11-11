from flask import Flask, jsonify, request,session
from flask_cors import CORS
import requests
API_KEY = '8WW0IRWXHCUCAQNO'
base_url = 'https://www.alphavantage.co/query?'
app = Flask(__name__)
CORS(app, supports_credentials=True)
@app.route("/api/stocks/search")
def stock_search():
    keyword = request.args.get("keyword","").strip()
    params = {
        'keyword': keyword,
        'api_key': API_KEY,
        'function': 'SYMBOL_SEARCH',
        'datatype': 'json'
    }
    url = base_url + f'function={params["function"]}&keywords={params["keyword"]}&datatype={params["datatype"]}&apikey={params["api_key"]}'
    result = requests.get(url)
    data = result.json()
    return data
app.run(debug=True, port=5000)