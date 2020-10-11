// custom imports
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const { createHook } = require('async_hooks');
const app = express();
const db = mongoose.connection;
const port = process.env.PORT || 8000;
const discord = new Webhook(
	'https://discord.com/api/webhooks/757947473250615450/YFPbzbxbbwqjp6bEvxQHn-LHJ24-aCTEOOQAL9NNjg-Bw93tlFqn_HqLpUIKZ6bpxCgh'
);

// basic app setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use('/static', express.static('static'));
app.use(
	express.urlencoded({
		extended: false,
	})
);

// SMTP Configuration for sending mail notification
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'theh4ckersbrain@gmail.com',
		pass: 'Oy[wCnRG;<Qav2]7pTtJ1fl{)',
	},
});

// database connection
mongoose.connect('mongodb://localhost/portfolioDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
	console.log('Connection to database is established successfully...');
});

// database schema
const msgSchema = new mongoose.Schema({
	fname: String,
	lname: String,
	email: String,
	message: String,
});

// compiling database schema to model
const dataDB = mongoose.model('dataDB', msgSchema);

// url routes
app.get('/', (req, res) => {
	res.status(200).render('index', {
		fname: '',
		fstatus: '',
		fmsg: '',
	});
});
// handling post requests
app.post('/', (req, res) => {
	var fname = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email;
	var msg = req.body.msg;
	new dataDB({
		fname: fname,
		lname: lname,
		email: email,
		message: msg,
	}).save(function (err, result) {
		if (err) {
			res.render('index', {
				fname: fname,
				fstatus: 'danger',
				fmsg:
					'Unexpected Error Occured while sending the Message. Try Again Later...',
			});
		} else {
			const mailContent = {
				from: 'theh4ckersbrain@gmail.com',
				to: email,
				subject: 'Thanks for Contacting us.',
				text: `Hey There ${fname},\nHope You're Doing well and Enjoying your time.\nThanks for contacting us,\nwill be back to you As soon as Possible\nThanks for being patient.\n\tBy - \n\t\tTheHackersBrain [Gaurav Raj]`,
			};
			transporter.sendMail(mailContent, function (error, info) {
				if (error) {
					res.render('index', {
						fname: fname,
						fstatus: 'danger',
						fmsg:
							'Unexpected Error Occured while sending the Message. Try Again Later...',
					});
				} else {
					const embed = new MessageBuilder()
						.setTitle('Contact App Message')
						.setThumbnail(
							'https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
						)
						.addField('Name: ', `${fname} ${lname}`, true)
						.addField('Email: ', email, true)
						.setDescription(msg)
						.setTimestamp();
					discord.send(embed);
				}
			});
			res.render('index', {
				fname: fname,
				fstatus: 'success',
				fmsg:
					'Message has been sent successfully. we will get back to you soon.',
			});
		}
	});
});

app.listen(port);
