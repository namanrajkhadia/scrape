import os
import logging
from flask import Flask, request, send_file, jsonify
import requests
from bs4 import BeautifulSoup
import re
from openpyxl import Workbook
from openpyxl.styles import PatternFill
from flask_cors import CORS
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
logging.basicConfig(level=logging.DEBUG)

def check_brand_presence(keyword, brand, marketplace="in"):
    url = f"https://www.amazon.in/s?k={keyword.replace(' ', '+')}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Currency": "INR"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        logging.info(f"Response URL: {response.url}")
        
        if "amazon.in" not in response.url:
            logging.error(f"Redirected to non-Indian Amazon site: {response.url}")
            return None, None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        all_results = soup.find_all('div', {'data-component-type': 's-search-result'})
        sponsored_present = False
        organic_present = False
        for result in all_results:
            title_element = result.find('span', {'class': 'a-text-normal'})
            if not title_element:
                continue
            title = title_element.text
            
            # Check for sponsored content based on the provided HTML structure
            is_sponsored = result.find('span', class_='puis-sponsored-label-text') is not None
            
            logging.info(f"Checking title: {title}, Sponsored: {is_sponsored}")
            if brand.lower() in title.lower():
                if is_sponsored:
                    sponsored_present = True
                    logging.info("Sponsored presence detected")
                else:
                    organic_present = True
                    logging.info("Organic presence detected")
            if sponsored_present and organic_present:
                break
        return sponsored_present, organic_present
    except requests.RequestException as e:
        logging.error(f"Error fetching results: {e}")
        return None, None

def create_excel_file(results, brand_name):
    wb = Workbook()
    ws = wb.active
    ws.title = "Amazon Search Results"
    
    # Add headers
    ws['A1'] = "Keyword"
    ws['B1'] = "Ads"
    ws['C1'] = "Organic"
    
    # Define colors
    green_fill = PatternFill(start_color="00FF00", end_color="00FF00", fill_type="solid")
    red_fill = PatternFill(start_color="FF0000", end_color="FF0000", fill_type="solid")
    
    # Add data and apply colors
    for row, result in enumerate(results, start=2):
        ws.cell(row=row, column=1, value=result['keyword'])
        
        if result['sponsored_present']:
            ws.cell(row=row, column=2, value="Present").fill = green_fill
        else:
            ws.cell(row=row, column=2, value="Not Present").fill = red_fill
        
        if result['organic_present']:
            ws.cell(row=row, column=3, value="Present").fill = green_fill
        else:
            ws.cell(row=row, column=3, value="Not Present").fill = red_fill
    
    # Save to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        wb.save(tmp.name)
        return tmp.name

@app.route('/api/check-brand', methods=['POST'])
def check_brand():
    try:
        logging.info("Received request to /api/check-brand")
        data = request.json
        logging.info(f"Received data: {data}")
        
        if not data:
            logging.error("No JSON data received")
            raise ValueError("No JSON data received")
        
        brand_name = data.get('brand_name')
        keywords = data.get('keywords')
        
        logging.info(f"Brand name: {brand_name}")
        logging.info(f"Keywords: {keywords}")
        
        if not brand_name or not keywords:
            logging.error("Missing brand_name or keywords")
            raise ValueError("Missing brand_name or keywords")

        results = []
        for keyword in keywords:
            keyword = keyword.strip()
            if keyword:
                logging.info(f"Checking keyword: {keyword}")
                sponsored_present, organic_present = check_brand_presence(keyword, brand_name)
                logging.info(f"Results for {keyword}: Sponsored: {sponsored_present}, Organic: {organic_present}")
                results.append({
                    'keyword': keyword,
                    'sponsored_present': sponsored_present,
                    'organic_present': organic_present
                })
        
        logging.info("Creating Excel file")
        excel_file = create_excel_file(results, brand_name)
        logging.info("Excel file created successfully")
        
        return send_file(excel_file, as_attachment=True, download_name=f"amazon_search_results_{brand_name}.xlsx")
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
