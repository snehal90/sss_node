var remove_images_list = [];
var app = angular.module('sss_master', ['ui.router', 'angularCSS']);
// app.controller('MasterCtrl', function($scope, $location, $rootScope) {
app.service('utilService', function($location) {

	getClass = function (path) {
	  	return ($location.path().substr(0, path.length) === path) ? 'active' : '';
	}

	formatDate = function (actual_date) {
		var actual_date = new Date(actual_date);
		var date_val = actual_date.getDate();
		var month_val = actual_date.getMonth()+1;
		var year_val = actual_date.getFullYear();
		var hour_val = actual_date.getHours();
		var minute_val = actual_date.getMinutes();

		var datepicker_val = year_val + '-' + month_val + '-' + date_val;
		var timepicker_val = hour_val + ':' + minute_val;

		return {'datepicker_val' : datepicker_val, 'timepicker_val' : timepicker_val};
	};

	formatImagePath = function(image_path, type) {
		console.log('in func.....');
		var splitted_path = image_path.split('/');
		var file_name = splitted_path[splitted_path.length - 1];
		if($.inArray(type.toUpperCase(), ['THUMB', 'MID']) !== -1) {
			splitted_path[splitted_path.length - 1] = type.toUpperCase();
		}
		splitted_path[splitted_path.length] = file_name;
		var formatted_url = splitted_path.join('/');
		console.log(formatted_url, "::::formatted_url");
		return formatted_url;
	};

	return {
		getClass : getClass,
		formatDate : formatDate,
		formatImagePath : formatImagePath,
	};
// });
});

$(document).on('click', '.file_remove', function(ev) {
	ev.stopPropagation();
    ev.preventDefault();
    var image_path = $(this).attr('data-path');
	remove_images_list[remove_images_list.length] = image_path;
	$(this).parents(".gallery-item").fadeOut(400,function(){
        $(this).remove();
    });
    return false;
});

function getTableJson(callback, req_data) {
	var req_list = JSON.parse(req_data['req_list']);
	var url = req_data['url'];
	var limit = req_data['iDisplayLength'] != undefined ? req_data['iDisplayLength'] : 20;
	var offset = req_data['iDisplayStart'] != undefined ? req_data['iDisplayStart'] : 0;
	var req_type = req_data['req_type'] != undefined ? req_data['req_type'] : 'EVENT';
	var sort_col = req_data['iSortCol_0'] != undefined ? req_data['iSortCol_0'] : '';
	var sort_val = req_data['sSortDir_0'] != undefined ? req_data['sSortDir_0'] : 'asc';
	sort_val = sort_val == 'asc' ? 1 : -1;
	var id_link = req_data['id_link'] != undefined ? req_data['id_link'] : '';
	var filter_list = req_data['filter_list'] != undefined ? JSON.parse(req_data['filter_list']) : {};
	var page = parseInt((parseInt(offset, 10) / parseInt(limit, 10)), 10) + 1;

    if(url.indexOf('?') === -1) {
        url += '?';
    } else {
        url += '&';
    }
    url += 'limit=' + limit + '&page=' + page;

    if(sort_col != '') {
        url += '&sort={"' + req_list[sort_col] + '":' + sort_val + '}';
    }
 

    for(var filter_key in filter_list) {
        url += '&' + filter_key + '=' + encodeURIComponent(filter_list[filter_key]);
    }

    var ucfirst_arr = ['type'];
	console.log(url, "::::req_list");
	$.ajax({
		url: url,
		method : 'GET',
		async : false,
		// dataType : 'json',
		success: function(ret_data) {
			console.log(ret_data, "::::::ret_data");
			var aaData = [];
			var iTotalRecords = 0;
			var iTotalDisplayRecords = 0;
		    if(ret_data['status'] == 'success') {
		    	var data_list = [];
		    	for(var j in ret_data['data']) {
		    		var data = ret_data['data'][j];
		    		dt = [];
		    		for(var k in req_list) {
		    			var param = req_list[k];
		    			if(param == 'is_active') {
		    				dt[dt.length] = data[param] == 1 ? 'Active' : 'Inactive';
		    			} else if($.inArray(param, ucfirst_arr) !== -1) {
		    				dt[dt.length] = data[param].charAt(0).toUpperCase() + data[param].substr(1)	;
		    			} else if(param == 'unique_id') {
		    				var str_to_replace = '{unique_id}';
		    				var link_dt = '#';
	                    	link_dt = id_link.replace(str_to_replace, data[param]);
		                    dt[dt.length] = '<a href="' + link_dt + '">' + data[param] + '</a>';
		                } else if(param == 'start_date' || param == 'end_date') {
		    				// dt[] = date('Y-m-d H:i', strtotime(data[param]));
		    				dt[dt.length] = data[param];
		    			} else {
		    				dt[dt.length] = data[param];
		    			}
		    		}
		            dt[dt.length] = '<div class="update_active update_status" rel="' + data['is_active'] + '" type="' + req_type + '" data_unique_id="' + data['unique_id'] + '">' + (data['is_active'] == 1 ? '<label class="switch switch-small" title="Click to deactivate this record"><input type="checkbox" checked="" value="1"><span></span></label>' : '<label class="switch switch-small" title="Click to activate this record"><input type="checkbox" value="1"><span></span></label>' ) + '</div>';

		    		data_list[data_list.length] = dt;
		    	}
				aaData = data_list;
				iTotalRecords = ret_data['meta']['count'];
				iTotalDisplayRecords = ret_data['meta']['count'];
				console.log(aaData, ":::::aaData");
				console.log(iTotalDisplayRecords, ":::::iTotalDisplayRecords");
				console.log(iTotalRecords, ":::::iTotalRecords");
				var formatted_data = {};
				formatted_data['aaData'] = aaData;
				formatted_data['iTotalRecords'] = iTotalRecords;
				formatted_data['iTotalDisplayRecords'] = iTotalDisplayRecords;
				callback(formatted_data);
		    }
		}, 
		error : function(err_data) {
			console.log(err_data, "::::::err_data");
		}
	});
}