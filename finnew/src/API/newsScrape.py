from googlesearch import search
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time

def get_urls(keywords, limit=5):
    search_term = ''
    search(term="",num_results=limit)
