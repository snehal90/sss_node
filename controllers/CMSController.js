var cms = require('../models/CMS');

exports.addCMSPage = function(request, response) {
	cms.addCMSPage(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.body);
};

exports.getPagesList = function(request, response) {
	cms.getPagesList(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.query);
};

exports.updateCMSPage = function(request, response) {
	var unique_id = request.params.unique_id;
	cms.updateCMSPage(function(err, ret_data) {
		if(err) {
			return response.status(err.responseHeaders.status).send(err.responseParams);
		}
		response.status(ret_data.responseHeaders.status).send(ret_data.responseParams);
	}, request.body, unique_id);
};