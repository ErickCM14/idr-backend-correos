const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log(PORT);
app.listen(PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`)
})

app.get('/', (req, res) => res.send('Hello World!'))

app.get(`/hola`, (req, res) => {
    return res.status(200).json({ messaga: 'Hola mundo' })
})

app.post('/enviar-email', async (req, resp) => {
    console.log(req.body);
    const body = req.body;
    if(!body.telefono){
        body.telefono = "Sin teléfono"
    }
    if(!body.telefono2){
        body.telefono2 = "Sin teléfono"
    }

    let msj = `<p>Este usuario se registro o intento registrarse en IDR demo en línea<p>` +
        `<p>Nombre: ${body.nombre} ${body.apellido}</p>` +
        `<p>Empresa: ${body.empresa}</p>` +
        `<p>Email: ${body.email}</p>` +
        `<p>Telèfono: ${body.telefono}</p>` +
        `<p>Telèfono 2: ${body.telefono2}</p>`;

    const msg = {
        to: ["contacto@sas-digital.com.mx", "idr.enlinea@gmail.com"], // Change to your recipient
        from: {
            name: "IDR en línea",
            email: 'contacto@sas-digital.com.mx', // Change to your verified sender
        },
        subject: 'IDR',
        text: msj,
        html: msj,
    }

    let envio = await envioMensaje(msg);
    console.log(envio);
    resp.send(envio);

})

app.post('/enviar-accesos', async (req, resp) => {
    const body = req.body;

    let msj = `<p>Muchas gracias por registrarse en IDR demo el línea<p>` +
        `<p>Sus accesos para ingresar son: <p>` +
        `<p>Email: ${body.email}</p>` +
        `<p>Password: ${body.password}</p>`;

    const msg = {
        to: body.email, // Change to your recipient
        from: {
            name: "IDR en línea",
            email: 'contacto@sas-digital.com.mx', // Change to your verified sender
        },
        subject: 'Accesos IDR',
        text: msj,
        html: msj,
    }

    let envio = await envioMensaje(msg);
    resp.send(envio);

})

envioMensaje = (msg) => {
    return new Promise(async (resolve, reject) => {
        try {
            let msjSend = await sgMail
                .send(msg)
                .then((resp) => {
                    console.log('Email sent')
                    resolve(resp)
                })
                .catch((error) => {
                    console.error(error)
                    reject(error)
                })
        } catch (error) {
            reject(error)
            console.log(error);
        }
    })
}