let express = require('express');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let session = require('express-session');
let passport = require('passport');
let localStrategy = require('passport-local');
let app = express();

mongoose
	.connect('mongodb+srv://admin:admin@hirehub.rs9bbun.mongodb.net/?retryWrites=true&w=majority')
	.then(function() {
		console.log('db working');
	})
	.catch(function(err) {
		console.log(err);
	});
//setup session after connecting to the DB
app.use(session({
	secret: 'ABCD01903LPAdk',
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			expires: Date.now() + 1000 * 60 * 60 * 24,
			maxAge: 1000 * 60 * 60 * 24
		}
})
);
let User = require('./models/userDB');
// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

let jobRoutes = require('./routes/jobs.js');
let notifRoutes = require('./routes/notifications');
let authRoutes = require('./routes/auth');

app.use(jobRoutes);
app.use(notifRoutes);
app.use(authRoutes);

app.listen(3000, function() {
	console.log('server started on port 3000');
});



