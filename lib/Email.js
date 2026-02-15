const nodemailer = require('nodemailer');
const config = require('../config');

class Email {
    constructor() {
        this.transporter = null;
        this.createTransport();
    }

    async createTransport() {
        // Eğer config'de kullanıcı adı yoksa, test için Ethereal hesabı oluştur
        if (!config.EMAIL.auth.user) {
            let testAccount = await nodemailer.createTestAccount();
            console.log("Test Account Created: ", testAccount.user);
            
            this.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass 
                }
            });
        } else {
            // Gerçek SMTP ayarları varsa onları kullan
            this.transporter = nodemailer.createTransport({
                host: config.EMAIL.HOST,
                port: config.EMAIL.PORT,
                secure: config.EMAIL.SECURE,
                auth: config.EMAIL.auth
            });
        }
    }

    async send(to, subject, text, html) {
        if (!this.transporter) {
            await this.createTransport();
        }

        let info = await this.transporter.sendMail({
            from: config.EMAIL.FROM, // Gönderen
            to: to,                  // Alıcı
            subject: subject,        // Konu
            text: text,              // Düz metin (HTML desteklemeyenler için)
            html: html               // HTML içeriği
        });

        console.log("Message sent: %s", info.messageId);
        
        // Sadece Ethereal kullanıyorsak önizleme linkini konsola bas
        if (!config.EMAIL.auth.user || info.messageId) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    }
}

module.exports = new Email();