let express = require('express');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let app = express();

mongoose
	.connect('mongodb+srv://admin:admin@hirehub.rs9bbun.mongodb.net/?retryWrites=true&w=majority')
	.then(function() {
		console.log('db working');
	})
	.catch(function(err) {
		console.log(err);
	});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

let jobRoutes = require('./routes/jobs.js');
let notifRoutes = require('./routes/notifications');

app.use(jobRoutes);
app.use(notifRoutes);

app.listen(4000, function() {
	console.log('server started on port 1000');
});



