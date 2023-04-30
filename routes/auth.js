let express = require('express');
const passport = require('passport');
let router = express.Router();
let User = require('../models/userDB');

router.get('/register', function(req, res){
	res.render('register');
});

router.post('/register',async function(req,res){
  let user=new User({
  username:req.body.username
  });
//.register is a function of passport.It does hashing salting and saving.
let registeredUser = await User.register(user, req.body.password);
// If the saved user is not logged in,cookie will automatically generate
//.login and .logout are passport's inbuilt functions
req.login(registeredUser, function(err) {
  if (err) {
    console.log('error while registering the user');
  }
  res.redirect('/jobs');
});
});

router.get('/login', function(req, res) {
	res.render('login');
});
//for arguments in login,first give login, then middleware and then function.
//passport.authenticate is a middleware provided by passport JS.It takes two arguments,firstly the strategy used and second the failure redirect url.
router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		res.redirect('/jobs');
	}
);

router.get('/logout', function(req, res) {
	req.logOut(function(err) {
		if (err) {
			console.log('error while logout');
		}
		res.redirect('/jobs');
	});
});

module.exports = router;

