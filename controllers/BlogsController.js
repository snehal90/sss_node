var blogs = require('../models/blogs');

exports.addBlog = function(request, response, callback) {
	blogs.add(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.body);
};

exports.updateBlog = function(request, response, callback) {
	var unique_id = request.params.unique_id;
	blogs.update(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.body, unique_id);
};

exports.getBlogs = function(request, response, callback) {
	blogs.getList(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.query);
};