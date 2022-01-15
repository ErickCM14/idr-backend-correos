const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log(PORT);
app.listen(PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`)
})

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });
  
  process.env.ACCESS_TOKEN = oauth2Client.getAccessToken();
  
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
  
  });

app.get('/', (req, res) => res.send('Hello World!'))

app.get(`/hola`, (req, res) => {
    return res.status(200).json({ messaga: 'Hola mundo' })
})

app.post('/enviar-email-restringido', async (req, resp) => {
    console.log(req.body);
    const body = req.body;
    if(!body.telefono){
        body.telefono = "Sin teléfono"
    }
    if(!body.telefono2){
        body.telefono2 = "Sin teléfono"
    }

    let msj = `<p>Este usuario intento registrarse en IDR demo en línea<p>` +
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

app.post('/enviar-email', async (req, resp) => {
    console.log(req.body);
    const body = req.body;
    if(!body.telefono){
        body.telefono = "Sin teléfono"
    }
    if(!body.telefono2){
        body.telefono2 = "Sin teléfono"
    }

    let msj = `<p>Este usuario se registro en IDR demo en línea<p>` +
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
        `<p>Password: ${body.password}</p></br>` +
        `<a href="https://idrenlinea.sas-digital.com.mx" target="_blank">IDR en linea - Login</a>`;

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

app.post('/enviar-datos', async (req, resp) => {
    const body = req.body;
    let enviar = await enviarEmail(body);
    console.log(enviar);
    return resp.status(201).send(body)
})

enviarEmail = (mensaje) => {
    if(!mensaje.telefono){
        mensaje.telefono = "Sin teléfono"
    }
    if(!mensaje.telefono2){
        mensaje.telefono2 = "Sin teléfono"
    }
    let msj = `<p>Este usuario creo un Menú gráfico en IDR demo en línea<p>` +
      `<p>Nombre: ${mensaje.nombre} ${mensaje.apellido}</p>` +
      `<p>Empresa: ${mensaje.empresa}</p>` +
      `<p>Email: ${mensaje.email}</p>` +
      `<p>Teléfono: ${mensaje.telefono}</p>` +
      `<p>Teléfono 2: ${mensaje.telefono2}</p>` +
      `<p> <a href="${mensaje.url}" target="_blank">Menú gráfico</a> </p>`;
    return new Promise(resolve => {
      sendMail(msj, info => {
        console.log("Ha sido enviado el correo");
        resolve(info)
      })
    })
}

async function sendMail(mensaje, callback) {

    let mailOptions = {
      from: 'IDR - Menú <contacto@sas-digital.com.mx>',
      to: 'contacto@sas-digital.com.mx',
    //   to: 'erick.info.oficial@gmail.com',
      cc: ['idr.enlinea@gmail.com'],
      subject: "Menú creado - IDR en línea",
      text: mensaje,
      html: mensaje,
      auth: {
        user: process.env.EMAIL,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
      }
    }
  
    let info = await transporter.sendMail(mailOptions);
  
    callback(info, "linea 175");
  }