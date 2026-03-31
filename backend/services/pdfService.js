const puppeteer = require('puppeteer');

async function generateTicketPDF(ticket) {
    const qrDataUrl = await generateQR(ticket.ticketId);
    const html = buildTicketHTML(ticket, qrDataUrl);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A5',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

    await browser.close();
    return pdfBuffer;
}