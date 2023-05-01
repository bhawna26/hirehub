let express = require('express');
let router = express.Router();
// model
let Job = require('../models/jobsDB');
let Notification=require('../models/notifyDB')
// middlewares, destructuring
let { isLoggedIn, isAdmin } = require('../middlewares/index');

router.get('/', function(req, res) {
	res.render('landing');
});

// index
router.get('/jobs', async function(req, res) {
	try {
		if (req.query.search && req.query.search.length > 0) {
			let regex = new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
			let foundJobs = await Job.find({ name: regex });
			res.render('index', { foundJobs });
		} else {
			// extract all the jobs from the database
			let foundJobs = await Job.find({});
			res.render('index', { foundJobs });
		}
	} catch (error) {
		console.log('error while extracting all jobs', error);
	}
});

// new
router.get('/jobs/new', isLoggedIn,isAdmin,function(req, res) {
	res.render('new');
});

// create
router.post('/jobs',isLoggedIn,isAdmin, async function(req, res) {
	try {
		// make a database object
		let newJob = new Job({
			name: req.body.name,
			address: req.body.address,
			image: req.body.image
		});
		await newJob.save();
		//push a new notification after creation of job
		let newNotify=new Notification({
			body:'A new job has been posted',
			author:newJob.name
		})
		await newNotify.save();
		res.redirect('/jobs');
	} catch (error) {
		console.log('error while adding a new job', error);
	}
});

// show
router.get('/jobs/:id', async function(req, res) {
	try {
		// fetch the required job by using id
		let id = req.params.id;
		//since mongo stores only id by default,to get other parameters as well we have to use .populate
		let job = await Job.findById(id).populate('appliedUsers');;
		res.render('show', { job });
	} catch (error) {
		console.log('error while fetching a job', error);
	}
});

// edit
router.get('/jobs/:id/edit',isLoggedIn,isAdmin, async function(req, res) {
	try {
		// fetch the required job by using id
		let id = req.params.id;
		let job = await Job.findById(id);
		res.render('edit', { job });
	} catch (error) {
		console.log('error while fetching a job for edit form', error);
	}
});

// update
router.patch('/jobs/:id',isLoggedIn,isAdmin, async function(req, res) {
	try {
    //this time we are not creating a DB object.we are just creating a JS object.
		let id = req.params.id;
		let updatedJob = {
			name: req.body.name,
			address: req.body.address,
			image: req.body.image,
      package:req.body.package,
      cgpa:req.body.cgpa,
      deadline: req.body.deadline,
			type: req.body.type
		};
		await Job.findByIdAndUpdate(id, updatedJob);
		//push a new notification after updation of job
		let newNotify=new Notification({
			body:'A new job has been updated',
			author:updatedJob.name
		})
		res.redirect(`/jobs/${id}`);
	} catch (error) {
		console.log('error while updating the job', error);
	}
});

// delete
router.delete('/jobs/:id',isLoggedIn,isAdmin, async function(req, res) {
	try {
		let id = req.params.id;
		await Job.findByIdAndDelete(id);
		res.redirect('/jobs');
	} catch (error) {
		console.log('error while deleting the job', error);
	}
});

router.get('/jobs/:jobId/apply', isLoggedIn, async function(req, res) {
	try {
		if (!req.user.cgpa) {
			return res.send('you have not entered your cgpa');
		}
		let { jobId } = req.params;
		let job = await Job.findById(jobId);
		if (req.user.cgpa < job.cgpa) {
			return res.send('your cgpa is not enough');
		}
		for (let user of job.appliedUsers) {
			if (user._id.equals(req.user._id)) { //.equals is a mongoose function used to compare two IDs
				return res.send('you can only apply once');
			}
		}
		job.appliedUsers.push(req.user);
		await job.save();
		res.redirect(`/jobs/${jobId}`);
	} catch (error) {
		console.log('error while applying in job', error);
	}
});

module.exports = router;