var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mytestacc2014@gmail.com',
    pass: 'my_test_acc_2014'
  }
});

exports.sendMail = function(data) {
	var mailOptions = {
	  from: 'Shree Swami Samarth <mytestacc2014@gmail.com>',
	  to: data['to'],
	  subject: data['subject'],
	  html: data['body']
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	});
};