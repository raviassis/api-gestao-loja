const mailSerice = require('./mailService');
const emailConfirmationService = {
    send({email, name, confirmation_token}) {
        return mailSerice.sendEmail({
            to: email, 
            subject: 'Confirme seu email',
            text: `
                Olá ${name}.
                Por favor, confirme seu endereço de email clicando no link abaixo
                para finalizar seu cadastro.
                ${process.env.APP_FRONTEND_URL}/email_confirmation/${confirmation_token}                    
            `
        });
    }
}

module.exports = emailConfirmationService;