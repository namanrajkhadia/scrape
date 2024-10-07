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
