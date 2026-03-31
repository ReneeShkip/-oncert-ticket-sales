function buildTicketHTML(user, event, ticket, qrDataUrl) {
  const date = new Date(ticket.date).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev'
  });
  return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .ticket {
          width: 600px; margin: 40px auto; border: 2px solid #5B86CB;
          border-radius: 12px; overflow: hidden;
        }
        .header { background: #3E5D93; color: white; padding: 24px; }
        .header h1 { margin: 0; font-size: 28px; }
        .body { display: flex; padding: 24px; gap: 24px; }
        .info { flex: 1; }
        .info p { margin: 8px 0; font-size: 15px; }
        .info strong { font-weight: bold; }
        .qr img { width: 150px; height: 150px; }
        .footer { background: #F4DCDC; text-align: center;
                  padding: 12px; font-size: 12px; color: #F4ADBD; }
        .orgs { display:flex; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h1>${event.ukr.title}</h1>
          <div class="orgs">
           ${event.eventAuthors?.map(a => `<h5>${a.ukr?.name}</h5>`).join(' · ') || ''}
          </div>
          <p>${date} · ${ticket.location.ukr.address} · ${ticket.location.ukr.country}</p>
        </div>
        <div class="body">
          <div class="info">
            <p><strong>Покупець:</strong> ${user.first_name} ${user.last_name}</p>
          </div>
          <div class="qr">
            <img src="${qrDataUrl}" />
            <p style="font-size:11px;text-align:center;margin:4px 0">Сканувати при вході</p>
          </div>
        </div>
        <div class="footer">
          Квиток дійсний лише з документом, що посвідчує особу
        </div>
      </div>
    </body>
    </html>
  `;
}
module.exports = { buildTicketHTML };