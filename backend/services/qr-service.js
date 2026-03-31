const QRCode = require('qrcode');

class QRService {
    async generateFromTicketId(ticketId) {
        const url = `${process.env.BASE_URL}/verify/${ticketId}`;
        return this._generate(url);
    }

    async generateFromData() {
        return this._generate(typeof data === 'object' ? JSON.stringify(data) : data);
    }

    async _generate(content, options = {}) {
        return QRCode.toDataURL(content, {
            width: 250,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
            ...options
        });
    }
}

module.exports = new QRService();