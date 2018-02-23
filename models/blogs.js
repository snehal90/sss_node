var blogs = db.collection('blogs');

var Checkit = require('checkit');
var moment = require('moment');
var slug = require('slug');
var errorCodes = require('../config/error');

exports.add = function(callback, data) {
	var checkit = new Checkit({
		blog_title : [
			{
				rule : 'required',
				message : 'Please provide the name of blog'
			},
			{
				rule : 'string',
				message : 'The name of blog must be a string'
			}
		],
		blog_author_name : {
			rule : 'required',
			message : 'Please provide the name of author of the blog'
		},
		blog_author_email : [
			{
				rule : 'required',
				message : 'Please provide the email of author of the blog'
			},
			{
				rule : 'email',
				message : 'Please provide the valid email of author of the blog'
			}
		],
		content : {
			rule : 'required',
			message : 'Please provide the content of blog'
		},
		blog_status : {
			rule : 'required',
			message : 'Please provide the status of blog'
		}
	});

	var body = data;

	checkit.run(body).then(function(validated) {
		data['slug'] = slug(data['blog_title']);
		data['unique_id'] = 'BLOGS_' + moment().valueOf();
		data['created_at'] = data['updated_at'] = moment().format();
		data['created_by'] = data['updated_by'] = data['blog_author_email'];
		data['is_active'] = !data['is_active'] ? 1 : data['is_active'];
		data['content_type'] = 'BLOG';

		gallery_list = [];
		// if(data['gallery'] != undefined && data['gallery'].length != 0) {
		// 	gallery_list = data['gallery'];
		// }
		
		// delete data['gallery'];
		save(data, gallery_list, 0, callback);

	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	})
}

function save (data, gallery_list, is_update, callback) {
	if(is_update == 0) {
		blogs.insert(data, {}, function(err, dt) {
			if(err) {
				var error = errorCodes.error_403.server_error;
				callback(error);
			} else {
				// if(gallery_list.length != 0) {
				// 	gallery.save(gallery_list, function() {});
				// }
				var result_response = errorCodes.error_200.success;

				result_response.responseParams.data = dt;
				callback(null, result_response);
			}
		});
	} else {
		blogs.update(data.condition, data.update, function(err, dt) {
			console.log(err, ":::err");
			if(err) {
				var error = errorCodes.error_403.server_error;
				callback(error);
			} else {
				// if(gallery_list.length != 0) {
				// 	gallery.save(gallery_list, function() {});
				// }
				var result_response = errorCodes.error_200.success;
				callback(null, result_response);
			}
		});
	}
}

exports.update = function(callback, data, unique_id) {
	var checkit = new Checkit({
		unique_id : [
			{
				rule : 'required',
				message : 'Please provide the unique_id of event'
			},
			{
				rule : 'string',
				message : 'The unique_id of event must be a string'
			}
		]
	});

	var body = {'unique_id' : unique_id};

	if(data['is_active'] == undefined && data['blog_status'] == undefined) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = 'Please provide data for updation. You can only update active flag and blog status.';
		return callback(error);
	}

	if(data['is_active'] != undefined) {
		body['is_active'] = data['is_active'];
	}

	if(data['blog_status'] != undefined) {
		body['blog_status'] = data['blog_status'];
	}

	checkit.run(body).then(function(validated) {
		gallery_list = [];
		// if(data['gallery'] != undefined && data['gallery'].length != 0) {
		// 	gallery_list = data['gallery'];
		// }
		
		// delete data['gallery'];
		var update_data = {};
		update_data['condition'] = {'unique_id' : unique_id};
		var update_dt_list = body;
		delete update_dt_list['unique_id'];
		update_data['update'] = {'$set' : update_dt_list};
		save(update_data, gallery_list, 1, callback);

	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	})
}