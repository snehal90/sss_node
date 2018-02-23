var blogs = db.collection('blogs');

var Checkit = require('checkit');
var moment = require('moment');
var async = require('async');
var slug = require('slug');
var mail_helper_obj = require('../helpers/mail_helper');
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
		data['is_active'] = !data['is_active'] ? 1 : parseInt(data['is_active'], 10);
		data['blog_status'] = !data['blog_status'] ? 1 : parseInt(data['blog_status'], 10);
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
		body['is_active'] = parseInt(data['is_active'], 10);
	}

	if(data['blog_status'] != undefined) {
		body['blog_status'] = parseInt(data['blog_status'], 10);
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
		if(data['blog_status'] == 1) {
			var custom_query = {};
			custom_query['unique_id'] = unique_id;
			custom_query['limit'] = 1;
			getList(function(err, res_data) {
				if(err) {
					callback(err);
				} else {
					var dt = res_data.responseParams.data;
					var mail_data = {};
					mail_data['to'] = dt[0].blog_author_email;
					mail_data['subject'] = 'Shree Swami Samarth Info';
					mail_data['body'] = 'Hello ' + dt[0].blog_author_name + ', <br/> Your blog with title "' + dt[0].blog_title + '" has been approved and now visible on site. Please visit our site again.';
					mail_helper_obj.sendMail(mail_data);
				}
			}, custom_query);
		}

	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	})
}

function getList(callback, query) {
	var filter_qry = {};
	var limit = 20;
	var offset = 0;
	var page = 1;
	var sort = {'created_at' : -1};

	for(var i in query) {
		if(i == 'limit') {
			limit = parseInt(query[i], 10);
		} else if(i == 'page') {
			page = parseInt(query[i], 10);
		} else if(i == 'is_active' || i == 'blog_status') {
			filter_qry[i] = parseInt(query[i], 10);
		}  else if(i == 'blog_author_name' || i == 'blog_title') {
			filter_qry[i] = {'$regex' : query[i]};
		} else {
			filter_qry[i] = query[i];
		}
	}

	var offset = (page - 1) < 0 ? 0 : ((page - 1) * limit);
	async.parallel([
		function(cb1) {
			blogs.find(filter_qry, {}).sort(sort).limit(limit).skip(offset).toArray(function(err, ret_data) {
				if(err) {
					var error = errorCodes.error_403.server_error;
					return callback(error);
				}
				cb1(null, {data : ret_data});
			});
		},
		function(cb2) {
			blogs.count(filter_qry, function(err, ret_data_count) {
				if(err) {
					var error = errorCodes.error_403.server_error;
					return callback(error);
				}

				var page_count = Math.ceil(ret_data_count / limit);
				var meta_data = {
					'count' : ret_data_count, 
					'page_count' : page_count, 
					'page' : page, 
					'limit' : limit
				};
				cb2(null, {meta : meta_data});
			});
		},
	], function(err, ret_data) {
		var res_dt = errorCodes.error_200.success;
		delete res_dt.responseParams.count;
		res_dt.responseParams.data = ret_data[0].data;
		res_dt.responseParams.meta = ret_data[1].meta;
		callback(null, res_dt);		
	});
}

exports.getList = getList;