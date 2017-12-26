exports.home = function(req, res, callback) {
	console.log('in home::::', req.route);
	// res.render('client/index.php', {title : 'This is home page'});
	res.render(VIEW_PATH + 'index.html', {title : 'This is home page'});
};

exports.admin_home = function(req, res, callback) {
	console.log('in admin home....');
	// res.render('client/index.php', {title : 'This is home page'});
	res.render(VIEW_PATH + 'admin_index.html', {title : 'This is admin home page'});
};
