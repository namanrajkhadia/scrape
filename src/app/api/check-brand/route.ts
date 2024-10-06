import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Dynamically import the required modules
  const fetchModule = await import('node-fetch');
  const { JSDOM } = await import('jsdom');
  const ExcelJS = await import('exceljs');
  const fetch = fetchModule.default;

  async function checkBrandPresence(keyword: string, brand: string, marketplace = "in") {
      const url = `https://www.amazon.${marketplace}/s?k=${encodeURIComponent(keyword.replace(' ', '+'))}`;
      const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      };

      console.log(`Checking for brand: ${brand} with keyword: ${keyword}`);

      try {
          const response = await fetch(url, { headers });
          const html = await response.text();
          const dom = new JSDOM(html);
          const document = dom.window.document;

          const allResults = Array.from(document.querySelectorAll('div[data-component-type="s-search-result"]'));
          console.log(`Found ${allResults.length} search results`);

          let sponsoredPresent = false;
          let organicPresent = false;

          for (const result of allResults) {
              const titleElement = result.querySelector('span.a-text-normal');
              if (!titleElement) continue;

              const title = titleElement.textContent || '';
              console.log(`Checking title: ${title}`);
              
              // Updated sponsored content detection
              const sponsoredElement = result.querySelector('span[data-component-type="s-sponsored-label-info-icon"]');
              const isSponsored = !!sponsoredElement;
              console.log(`Is sponsored: ${isSponsored}`);

              if (title.toLowerCase().includes(brand.toLowerCase())) {
                  console.log(`Brand found in title`);
                  if (isSponsored) {
                      sponsoredPresent = true;
                      console.log(`Sponsored presence detected`);
                  } else {
                      organicPresent = true;
                      console.log(`Organic presence detected`);
                  }
              }

              if (sponsoredPresent && organicPresent) break;
          }

          console.log(`Final result - Sponsored: ${sponsoredPresent}, Organic: ${organicPresent}`);
          return [sponsoredPresent, organicPresent];
      } catch (error) {
          console.error(`Error fetching results: ${error}`);
          return [null, null];
      }
  }

  async function createExcelFile(results: any[], brandName: string) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Amazon Search Results');

      worksheet.addRow(['Keyword', 'Ads', 'Organic']);

      const greenFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '00FF00' }
      };

      const redFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }
      };

      results.forEach((result) => {
          const row = worksheet.addRow([
              result.keyword,
              result.sponsoredPresent ? 'Present' : 'Not Present',
              result.organicPresent ? 'Present' : 'Not Present'
          ]);

          row.getCell(2).fill = result.sponsoredPresent ? greenFill : redFill;
          row.getCell(3).fill = result.organicPresent ? greenFill : redFill;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
  }

  try {
      const data = await request.json();
      const brandName = data.brand_name;
      const keywords = data.keywords;
      const results = [];

      for (const keyword of keywords) {
          const trimmedKeyword = keyword.trim();
          if (trimmedKeyword) {
              const [sponsoredPresent, organicPresent] = await checkBrandPresence(trimmedKeyword, brandName);
              results.push({
                  keyword: trimmedKeyword,
                  sponsoredPresent,
                  organicPresent
              });
          }
      }

      console.log('Final results:', results);

      const excelBuffer = await createExcelFile(results, brandName);

      return new NextResponse(excelBuffer, {
          status: 200,
          headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename=amazon_search_results_${brandName}.xlsx`,
          },
      });
  } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
