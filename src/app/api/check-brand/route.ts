import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import ExcelJS from 'exceljs';

async function checkBrandPresence(keyword: string, brand: string, marketplace = "in") {
    const url = `https://www.amazon.${marketplace}/s?k=${encodeURIComponent(keyword.replace(' ', '+'))}`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };

    try {
        const response = await fetch(url, { headers });
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const allResults = document.querySelectorAll('div[data-component-type="s-search-result"]');
        let sponsoredPresent = false;
        let organicPresent = false;

        for (const result of allResults) {
            const titleElement = result.querySelector('span.a-text-normal');
            if (!titleElement) continue;

            const title = titleElement.textContent || '';
            const isSponsored = result.querySelector('span:not([data-component-type]):not([class]):not([id])') !== null;

            if (brand.toLowerCase() in title.toLowerCase()) {
                if (isSponsored) {
                    sponsoredPresent = true;
                } else {
                    organicPresent = true;
                }
            }

            if (sponsoredPresent && organicPresent) break;
        }

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

export async function POST(request: Request) {
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
