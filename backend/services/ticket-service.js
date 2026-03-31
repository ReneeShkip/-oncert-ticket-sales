const qrService = require('./qrService');
const pdfService = require('./pdfService');
const emailService = require('./emailService');
const { buildTicketHTML } = require('../templates/ticketTemplate');

async function processTicket(ticket) {
    const qrDataUrl = await qrService.generateFromTicketId(ticket.id);
    const html = buildTicketHTML(ticket, qrDataUrl);
    const pdfBuffer = await pdfService.fromHTML(html);
    await emailService.sendTicket(ticket.buyerEmail, ticket, pdfBuffer);
}

module.exports = { processTicket };