const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
});

async function sendTicketEmail(email, ticket) {
    const pdfBuffer = await generateTicketPDF(ticket);

    await transporter.sendMail({
        from: '"My Events" <noreply@myevents.com>',
        to: email,
        subject: `Ваш квиток: ${ticket.ukr.title}`,
        html: `
      <h2>Дякуємо за покупку!</h2>
      <p>Ваш квиток на <strong>${ticket.ukr.title}</strong> додано у вкладенні.</p>
      <p>Покажіть QR-код при вході.</p>
    `,
        attachments: [{
            filename: `ticket-${ticket.tickets.date_id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
}