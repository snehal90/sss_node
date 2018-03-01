var Checkit = require('checkit');
var errorCodes = require('../config/error');
var _ = require('underscore');
var moment = require('moment');
var slug = require('slug');
var async = require('async');
var gallery = require('../models/gallery');

Checkit.Validator.prototype.checkEnum = function(val) {
	var valid_pages = ['SWAMI_LEELA', 'SWAMI_VACHAN', 'HOME', 'CONTACT_US', 'ABOUT_US'];
	if(_.indexOf(valid_pages, val) == -1) {
		throw new Error('The content type should be valid');
	}

}

exports.addCMSPage = function(callback, data) {
	var checkit_root = new Checkit({
		content_type : [
			{
				rule : 'required'
			},
			{
				rule : 'checkEnum'
			}
		]
	});

	var body = data;

	checkit_root.run(body).then(function() {
		var rules = {
			title : [
				{
					rule : 'required',
					message : 'Please provide the title'
				},
				{
					rule : 'string',
					message : 'The title must be a string'
				}
			],
			content : {
				rule : 'required',
				message : 'Please provide the content'
			}
		};
		if(_.indexOf(['SWAMI_VACHAN', 'SWAMI_LEELA'], data['content_type'].toUpperCase()) == -1) {
			rules['bg_image'] = {
				rule : 'required',
				message : 'Please provide the background image'
			};
		}
		var checkit = new Checkit(rules);
		checkit.run(body).then(function(validated) {
			data['slug'] = slug(data['title']);
			data['unique_id'] = data['content_type'] + '_' + moment().valueOf();
			data['created_at'] = data['updated_at'] = moment().format();
			data['created_by'] = data['updated_by'] = 'admin@gmail.com';
			data['is_active'] = !data['is_active'] ? 1 : parseInt(data['is_active'], 10);

			gallery_list = [];
			if(data['gallery'] != undefined && data['gallery'].length != 0) {
				gallery_list = data['gallery'];
			}
			
			delete data['gallery'];
			save(data, gallery_list, 0, callback);

		}).catch(Checkit.Error, function(err) {
			var error = errorCodes.error_400.custom_invalid_params;
			error.responseParams.message = err.toJSON();
		  	callback(error);
		})

	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	});
};

exports.updateCMSPage = function(callback, data, unique_id) {
	var checkit_root = new Checkit({
		content_type : [
			{
				rule : 'required'
			},
			{
				rule : 'checkEnum'
			}
		],
		unique_id : [
			{
				rule : 'required'
			}
		]
	});

	var body = data;
	body['unique_id'] = unique_id;

	var remove_keys = ['title', 'slug', 'unique_id'];

	checkit_root.run(body).then(function() {
		for(var z in remove_keys) {
			delete data[remove_keys[z]];
		}

		var update_data = {};
		update_data.update = {};
		update_data.condition = {'unique_id' : unique_id};
		data['updated_at'] = moment().format();
		data['updated_by'] = 'admin@gmail.com';

		if(data['is_active'] != undefined) {
			data['is_active'] = parseInt(data['is_active'], 10);
		}
		var gallery_list = [];
		if(data['remove_images'] && data['remove_images'].length != 0) {
			var remove_images = data['remove_images'];
			console.log(remove_images, ":::remove_images");
			var delete_data = {};
			delete_data.update = {};
			delete_data.condition = update_data.condition;

			delete_data.update = remove_images;
			deleteImages(function() {}, delete_data.update, delete_data.condition);
			delete data['remove_images'];
		}
		if(data['gallery'] != undefined && data['gallery'].length != 0) {
			gallery_list = data['gallery'];
		}
		
		delete data['gallery'];
		if(data['images'] && data['images'].length != 0) {
			update_data.update['$push'] = {'images' : { '$each' : data['images']}};
			delete data['images'];
			// save(update_data, gallery_list, 1, callback);
		}
		update_data.update['$set'] = data;
		update_data['content_type'] = data['content_type'];
		save(update_data, gallery_list, 1, callback);
	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	});
};

function save (data, gallery_list, is_update, callback) {
	var collection_name = data['content_type'].toLowerCase();
	var collection = db.collection(collection_name);
	if(is_update == 0) {
		collection.insert(data, {}, function(err, dt) {
			if(err) {
				var error = errorCodes.error_403.server_error;
				callback(error);
			} else {
				if(gallery_list.length != 0) {
					gallery.save(gallery_list, function() {});
				}
				var result_response = errorCodes.error_200.success;

				result_response.responseParams.data = dt;
				callback(null, result_response);
			}
		});
	} else {
		collection.update(data.condition, data.update, function(err, dt) {
			console.log(err, ":::err");
			if(err) {
				var error = errorCodes.error_403.server_error;
				callback(error);
			} else {
				if(gallery_list.length != 0) {
					gallery.save(gallery_list, function() {});
				}
				var result_response = errorCodes.error_200.success;
				callback(null, result_response);
			}
		});
	}
}

exports.getPagesList = function (callback, data) {
	var checkit_root = new Checkit({
		content_type : [
			{
				rule : 'required'
			},
			{
				rule : 'checkEnum'
			}
		]
	});

	var body = data;

	checkit_root.run(body).then(function() {
		var qry = {};
		var limit = 20;
		var page = 1;
		var offset = 0;

		_.each(data, function(elem, index) {
			if(index == 'limit') {
				limit = elem > 0 ? parseInt(elem, 10) : 20;
			} else if(index == 'page') {
				page = elem > 0 ? parseInt(elem, 10) : 1;
			} else if(index == 'title') {
				qry[index] = {'$regex' : elem};
			} else if(index == 'is_active') {
				qry[index] = parseInt(elem, 10);
			} else {
				qry[index] = elem;
			}
		});

		offset = (page - 1) * limit;

		var collection_name = _.indexOf(['HOME', 'CONTACT_US', 'ABOUT_US'], collection_name) != -1 ? 'cms' : data['content_type'].toLowerCase();
		var collection = db.collection(collection_name);

		async.parallel([
			function(cb1) {
				collection.find(qry, {}).limit(limit).skip(offset).toArray(function(err, data_list) {
					if(err) {
						var error = errorCodes.error_403.server_error;
						callback(error);
					} else {
						cb1(null, {'data' : data_list});
					}
				});
			},
			function(cb2) {
				collection.count(qry, function(err, data_count) {
					if(err) {
						var error = errorCodes.error_403.server_error;
						callback(error);
					} else {
						var page_count = Math.ceil(data_count / limit);
						var meta_data = {};
						meta_data['count'] = data_count;
						meta_data['page'] = page;
						meta_data['page_count'] = page_count;
						cb2(null, {'meta' : meta_data});
					}
				});
			}
		], function(err, final_cb) {
			var res_dt = errorCodes.error_200.success;
			delete res_dt.responseParams.count;
			res_dt.responseParams.data = final_cb[0].data;
			res_dt.responseParams.meta = final_cb[1].meta;
			callback(null, res_dt);
		});
	}).catch(Checkit.Error, function(err) {
		var error = errorCodes.error_400.custom_invalid_params;
		error.responseParams.message = err.toJSON();
	  	callback(error);
	})
}