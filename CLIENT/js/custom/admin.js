var app = angular.module('sss_admin', ['ui.router', 'sss_master', 'angularCSS', 'config', 'ngFileUpload', 'ngCookies']);
var images_list = [];
var bg_images_list = [];
var gallery_list = [];

app.config(['$stateProvider', '$urlRouterProvider', '$cssProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $cssProvider, $locationProvider) {
	angular.extend($cssProvider.defaults, {
	    persist: true,
	    preload: true,
	});

    // $urlRouterProvider.otherwise('/admin/dashboard');
	$stateProvider.state('admin', {
		url: '/admin',
		abstract: true,
		templateUrl : '/views/masters/partials/admin_body.html',
		controller : 'CommonCtrl'
	}).state('login', {
		url: '/login',
		templateUrl : '/views/login/login_view.html',
		css: ['/css/theme-default.css'],
		controller: 'LoginCtrl'
	})/*.state('admin.root_url', {
		url: '/admin',
		templateUrl : '/views/dashboard/home.html',
		css: ['/css/theme-default.css'],
		controller: 'HomeCtrl',
	})*/.state('admin.dashboard', {
		url: '/dashboard',
		templateUrl : '/views/dashboard/home.html',
		css: ['/css/theme-default.css'],
		controller: 'HomeCtrl'
	}).state('admin.events', {
		url: '/events',
		templateUrl : '/views/events/list.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('eventListView');
			}, 500);
		},
		controller : 'EventCtrl'
	}).state('admin.events_create', {
		url: '/events/create',
		templateUrl : '/views/events/create_view.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('createView');
	        })
		},
		controller : 'EventCtrl'
	}).state('admin.events_edit', {
		url: '/events/:unique_id',
		templateUrl : '/views/events/edit_view.html',
		css: ['/css/theme-default.css'],

		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('editView', $stateParams.unique_id);
	        })
		},
		controller : 'EventCtrl'
	}).state('admin.blogs', {
		url: '/blogs',
		templateUrl : '/views/blogs/list.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('blogListView');
			}, 500);
		},
		controller : 'BlogCtrl'
	}).state('admin.blogs_create', {
		url: '/blogs/create',
		templateUrl : '/views/blogs/create_view.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('createView');
	        })
		},
		controller : 'BlogCtrl'
	}).state('admin.blogs_edit', {
		url: '/blogs/:unique_id',
		templateUrl : '/views/blogs/edit_view.html',
		css: ['/css/theme-default.css'],

		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('editView', $stateParams.unique_id);
	        })
		},
		controller : 'BlogCtrl'
	}).state('admin.cms', {
		url: '/cms',
		templateUrl : '/views/cms/list.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('cmsListView');
			}, 500);
		},
		controller : 'CMSCtrl'
	}).state('admin.cms_create', {
		url: '/cms/create',
		templateUrl : '/views/cms/create_view.html',
		css: ['/css/theme-default.css'],
		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('createView');
	        })
		},
		controller : 'CMSCtrl'
	}).state('admin.cms_edit', {
		url: '/cms/:unique_id',
		templateUrl : '/views/cms/edit_view.html',
		css: ['/css/theme-default.css'],

		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('editView', $stateParams.unique_id);
	        })
		},
		controller : 'CMSCtrl'
	});
    // $urlRouterProvider.otherwise('/404');
	$locationProvider.html5Mode(true);
}]);

app.run(function($rootScope, $window, $http, CONFIGS, utilService, $cookies) {
	$rootScope.utilService = utilService;
	$rootScope.base_url = location.origin + '/';
	$window.addEventListener('beforeunload', function() {
    	var file_paths = [];
    	console.log('in beforeunload');
		for(var x in images_list) {
			file_paths[file_paths.length] = images_list[x].path;
		}
		remove_images_list = [];
		$.ajax({
			// url : CONFIGS.api_url + 'deleteFiles',
			url : '/api/v1/deleteFiles',
			method : 'post',
			async: false,
			data : {
				'file_paths' : JSON.stringify(file_paths)
			}
		}).success(function(ret_dt) {

			if(ret_dt.status == 'success') {
				images_list = [];
				gallery_list = [];
			}
			return null;
		});
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

		var isAuthenticationRequired = 0;
		console.log(toState.name, ":::toState");
		console.log(fromState, ":::fromState");
		if($cookies.get('user_email') == undefined) {
			isAuthenticationRequired = 1;
		}
		console.log(isAuthenticationRequired, ":::isAuthenticationRequired");

		if(isAuthenticationRequired == 1 && toState.name != 'login')
		{
		console.log(isAuthenticationRequired, ":::in ifff");
		  event.preventDefault();
		  location.href = $rootScope.base_url + 'login'
		}
	});
});

app.controller('HomeCtrl', function($scope) {
	console.log('in home controller.........');
	$scope.page_heading = "Dashboard";
});

app.controller('CommonCtrl', function($scope, $cookies) {
	$scope.logout = function() {
		$cookies.remove('user_id');
		$cookies.remove('user_first_name');
		$cookies.remove('user_last_name');
		$cookies.remove('user_email');
		$cookies.remove('user_access_token');
		location.href = $scope.base_url + 'login';
	};
});

app.controller('LoginCtrl', function($scope, $http, CONFIGS, $cookies) {
	// $scope.page_heading = "Login";

	$scope.login = function() {
		console.log('in login functionSS');
		$('label.error').remove();
		var email = $.trim($scope.email);
		var password = $.trim($scope.password);
		// var images = files_dt.length != 0 ? files_dt : {};
		var error_msg = {};
		var email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
		if(email == '') {
			error_msg['#email'] = 'Please enter email';
		} else if (!email_regex.test(email)) {
			error_msg['#email'] = 'Please enter a valid email';
        }

		if(password == '') {
			error_msg['#password'] = 'Please enter password';
		}

		// console.log(error_msg, "::::error_msg");
		if(Object.keys(error_msg).length != 0) {
			showError(error_msg);
		} else {

			var post_data = {};

			post_data = {
				email : email,
				password : password
			};

			var headers = {'secret_key' : CONFIGS.secret_key, "accept": "application/json"};
			// console.log(post_data, "::::post_data");
			// return false;

			$http({
				// url : CONFIGS.api_url + 'user/login',
				url : '/api/v1/user/login',
				headers : headers,
				method : 'post',
				data : post_data,
				dataType:'json',
			}).success(function(ret_dt, status, headers) {
				if(ret_dt.status == 'success') {
					$('.main_error_wrapper').hide();
					$('#message-box-success').show();
					$cookies.put('user_id', ret_dt.user._id);
					$cookies.put('user_first_name', ret_dt.user.first_name);
					$cookies.put('user_last_name', ret_dt.user.last_name);
					$cookies.put('user_email', ret_dt.user.email);
					$cookies.put('user_access_token', headers('access_token'));
					// console.log(status, ":::::status");
					// console.log(headers(), ":::::headers");
					// console.log($cookies.get('user'), ":::::cookie");
					setTimeout(function() {
						location.href = $scope.base_url + 'admin/dashboard';
					}, 1000);

				} else {
					if(typeof ret_dt.message == 'string') {
						$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
						$('.main_error_wrapper').addClass('alert-danger').show();
					} else {

					}
					$('html, body').animate({
						scrollTop : 0
					}, 'slow');
				}
			}).error(function(ret_dt) {
				console.log(ret_dt, "::::errr ret_dt");
				if(typeof ret_dt.message == 'string') {
					$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
					$('.main_error_wrapper').addClass('alert-danger').show();
				} else {

				}
				$('html, body').animate({
					scrollTop : 0
				}, 'slow');
			});
		}
	};
});

app.controller('EventCtrl', function($scope, $http, CONFIGS, $timeout, Upload, $compile, $rootScope) {
	$scope.page_heading = "Events";
	$scope.save_btn_action = 'addEvent';
	$scope.save_btn_text = "Save";
	var link = $scope.base_url + 'admin/events/{unique_id}';
	var filter_list = {};

	// $timeout(function() {
	// 	event_list_table({});
	// }, 500);
	$scope.$on('eventListView', function(event) {
		event_list_table({});
	});

	$scope.filter_clicked = function(key, $event, event_type, value) {
		if(event_type == 'keyup') {
			$event.stopPropagation();
			$event.preventDefault();
			if($event.keyCode == 13 || $.trim(value) == '') {
				filter_list[key] = $.trim(value);
				if($.trim(value) == '') {
					delete filter_list[key];
				}
				event_list_table(filter_list);
			}
		} else if(event_type == 'change') {
			filter_list[key] = $.trim(value);
			if($.trim(value) == '') {
				delete filter_list[key];
			}
			event_list_table(filter_list);
		}
	};

	function event_list_table(filter_list) {
		$("#start_date,#end_date").datepicker({
	        dateFormat: 'yyyy-mm-dd',
	        // endDate: new Date(),
	    }).on('changeDate', function (ev) {
	        // checkout.hide();
	    }).data('datepicker');
		// var url = CONFIGS.api_url + 'events';
		var url = '/api/v1/events';

		var req_data = {};
		req_data['url'] = url;
		req_data['req_list'] = JSON.stringify(["unique_id", "name", "start_date", "end_date", "is_active", "type"]);
		req_data['id_link'] = encodeURIComponent(link);
		req_data['filter_list'] = JSON.stringify(filter_list);
		req_data['req_type'] = 'EVENT';

		getTableJson(function(ret_data) {
			console.log(ret_data['aaData']);	
			$("#events_list").dataTable({
				"bDestroy": true,
				// "bProcessing": true,
			    // "bServerSide": true,
			    "bSortClasses": false,
			    "bAutoWidth": false,
			    "bLengthChange": false,
			    "iDisplayLength": 20,
			    "aaData": ret_data['aaData'],
			    "aoColumns": [
			    	{"bSortable": false, "bSearchable": false}, //uniqueId
			    	{"bSortable": false, "bSearchable": false}, //name
			    	{"bSortable": false, "bSearchable": false}, //start_date
			    	{"bSortable": false, "bSearchable": false}, //end_date
			    	{"bSortable": false, "bSearchable": false}, //is_active
			    	{"bSortable": false, "bSearchable": false}, //type
			    	{"bSortable": false, "bSearchable": false} //active/inactive update
			    ],
			    "fnInitComplete": function(settings, json) {
					var updateStatus = angular.element($('.update_status'));
					updateStatus.bind('click', $scope.statusUpdate);
				}
			});
		}, req_data);
		// var ret_data = getTableJson(req_data);

		// $http({
		// 	url: '/ajaxDatatableLoad.php?url=' + url +'&req_list=' + JSON.stringify(["unique_id", "name", "start_date", "end_date", "is_active", "type"]) + '&id_link=' + encodeURIComponent(link) + '&filter_list=' + JSON.stringify(filter_list) + '&req_type=EVENT',
		// 	method : 'GET',
		// 	// dataType : 'json',
		// 	success: function(ret_data) {
		// 		console.log(ret_data, "::::::ret_data");
		// 	}, 
		// 	error : function(err_data) {
		// 		console.log(err_data, "::::::err_data");
		// 	}
		// });

		$("#events_list_filter").hide();
	}

	$scope.uploadFiles = function (files) {
        $scope.files = files;
        if (files && files.length) {
            Upload.upload({
                // url: CONFIGS.api_url + 'fileUpload',
                url: '/api/v1/fileUpload',
                method: 'post',
                data: {
                    files: files,
                    type: 'EVENT'
                }
            }).then(function (response) {
                if(response.data.status == 'success') {
                	images_list.push.apply(images_list, response.data.data.images_list);
                	gallery_list.push.apply(gallery_list, response.data.data.gallery_list);
                }
            });
        }
    };

	$scope.addEvent = function() {
		$('label.error').remove();
		var name = $.trim($('#name').val());
		var short_description = $.trim($('#short_description').val());
		var content = $.trim($('#content').code());
		var start_date = $.trim($('#start_date').val());
		var start_time = $.trim($('#start_time').val());
		var end_date = $.trim($('#end_date').val());
		var end_time = $.trim($('#end_time').val());
		var is_active = $.trim($('.is_active:checked').val());
		// var images = files_dt.length != 0 ? files_dt : {};
		var error_msg = {};
		if(name == '') {
			error_msg['#name'] = 'Please enter name';
		}

		if($.trim(String(content).replace(/<[^>]+>/gm, '')) == '') {
			error_msg['#content'] = 'Please enter content';
		}

		if(start_date == '' || start_time == '') {
			error_msg['#start_datetime_container'] = 'Please enter start datetime of event';
		}

		if(end_date == '' || end_time == '') {
			error_msg['#end_datetime_container'] = 'Please enter end datetime of event';
		}

		if(is_active == '' || is_active == undefined) {
			error_msg['#is_active_container'] = 'Please select whether event is active or inactive';
		}

		console.log(error_msg, "::::error_msg");
		if(Object.keys(error_msg).length != 0) {
			showError(error_msg);
		} else {

			var post_data = {};
			var start_time_splitted = start_time.split(':');
			start_time_splitted[0] = start_time_splitted[0] <= 9 ? '0' + start_time_splitted[0] : start_time_splitted[0];
			start_time = start_time_splitted.join(':');
			var end_time_splitted = end_time.split(':');
			end_time_splitted[0] = end_time_splitted[0] <= 9 ? '0' + end_time_splitted[0] : end_time_splitted[0];
			end_time = end_time_splitted.join(':');

			var start_datetime = start_date + ' ' + start_time;
			var end_datetime = end_date + ' ' + end_time;

			post_data = {
				name : name,
				content : content,
				short_description : short_description,
				start_date : start_datetime,
				end_date : end_datetime,
				is_active : is_active,
			};

			if(images_list.length != 0) {
				post_data['images'] = images_list;
			}

			if(gallery_list.length != 0) {
				post_data['gallery'] = gallery_list;
			}

			console.log(post_data, "::::post_data");
			// return false;

			$('label.error').remove();
			$http({
				url : '/api/v1/event/add',
				method : 'post',
				data : post_data
			}).success(function(ret_dt) {
				if(ret_dt.status == 'success') {
					$('.main_error_wrapper').hide();
					$('#message-box-success').show();
					images_list = [];
					gallery_list = [];
					setTimeout(function() {
						location.href = $scope.base_url + 'admin/events';
					}, 1000);

				} else {
					if(typeof ret_dt.message == 'string') {
						$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
						$('.main_error_wrapper').addClass('alert-danger').show();
					} else {

					}
					$('html, body').animate({
						scrollTop : $('.page-content-wrap').offset().top
					}, 'slow');
				}
				console.log(ret_dt, "::::ret_dt");
			});
		}
	};

	$scope.$on('editView', function(event, unique_id) {

	    $http({
			url : '/api/v1/events/?unique_id=' + unique_id,
			method : 'get',
		}).success(function(ret_dt) {
			if(ret_dt.status == 'success') {
				var event_list = ret_dt.data[0];
				$scope.name = event_list.name;
				$scope.unique_id = unique_id;
				$scope.short_description = event_list.short_description;
				$scope.content = event_list.content;

				var start_datetime = event_list.start_date;
				var formatted_start_date = $rootScope.utilService.formatDate(start_datetime);
				// $scope.start_date = formatted_start_date.datepicker_val;
				var start_date = formatted_start_date.datepicker_val;
				var start_time = formatted_start_date.timepicker_val;
				$("#start_time").timepicker('setTime', start_time);
				$("#start_date").datepicker('setDates', start_date)

				var end_datetime = event_list.end_date;
				var formatted_end_date = $rootScope.utilService.formatDate(end_datetime);
				// $scope.end_date = formatted_end_date.datepicker_val;
				var end_date = formatted_end_date.datepicker_val;
				var end_time = formatted_end_date.timepicker_val;
				$("#end_time").timepicker('setTime', end_time);
				$("#end_date").datepicker('setDates', end_date)
				
				$scope.is_active = event_list.is_active;
				$scope.existing_images = event_list.images;
				$('#content').code($scope.content);
				$scope.save_btn_action = 'update';
				$scope.save_btn_text = "Update";
			}
		});
	});

	$scope.removeImage = function($event) {
		var image_path = $($event.target).attr('data_path');
		remove_images_list[remove_images_list.length] = remove_images_list;
	};

	$scope.statusUpdate = function($event) {
		var id = $($event.target).closest('.update_status').attr('data_unique_id');
		var attr_rel = $($event.target).closest('.update_status').attr('rel');
		var is_active = attr_rel == 1 ? 0 : 1;

		$scope.update(id, {'is_active' : is_active});
	};


	$scope.update = function(id, post_data) {
		$('label.error').remove();
		if(post_data == undefined) {
			var name = $.trim($scope.name);
			var short_description = $.trim($('#short_description').val());
			var content = $.trim($('#content').code());
			// var start_date = $.trim($scope.start_date);
			// var start_time = $.trim($scope.start_time);
			// var end_date = $.trim($scope.end_date);
			// var end_time = $.trim($scope.end_time);
			var start_date = $.trim($("#start_date").val());
			var start_time = $.trim($("#start_time").val());
			var end_date = $.trim($("#end_date").val());
			var end_time = $.trim($("#end_time").val());
			var is_active = $.trim($('.is_active:checked').val());
			// var images = files_dt.length != 0 ? files_dt : {};
			var error_msg = {};
			if(name == '') {
				error_msg['#name'] = 'Please enter name';
			}

			if($.trim(String(content).replace(/<[^>]+>/gm, '')) == '') {
				error_msg['#content'] = 'Please enter content';
			}

			if(start_date == '' || start_time == '') {
				error_msg['#start_datetime_container'] = 'Please enter start datetime of event';
			}

			if(end_date == '' || end_time == '') {
				error_msg['#end_datetime_container'] = 'Please enter end datetime of event';
			}

			if(is_active == '' || is_active == undefined) {
				error_msg['#is_active_container'] = 'Please select whether event is active or inactive';
			}

			console.log(error_msg, "::::error_msg");
			if(Object.keys(error_msg).length != 0) {
				showError(error_msg);
			} else {

				var post_data = {};
				var start_time_splitted = start_time.split(':');
				start_time_splitted[0] = start_time_splitted[0] <= 9 ? '0' + start_time_splitted[0] : start_time_splitted[0];
				start_time = start_time_splitted.join(':');
				var end_time_splitted = end_time.split(':');
				end_time_splitted[0] = end_time_splitted[0] <= 9 ? '0' + end_time_splitted[0] : end_time_splitted[0];
				end_time = end_time_splitted.join(':');

				var start_datetime = start_date + ' ' + start_time;
				var end_datetime = end_date + ' ' + end_time;

				post_data = {
					name : name,
					content : content,
					short_description : short_description,
					start_date : start_datetime,
					end_date : end_datetime,
					is_active : is_active,
				};

				if(images_list.length != 0) {
					post_data['images'] = images_list;
				}

				if(gallery_list.length != 0) {
					post_data['gallery'] = gallery_list;
				}

				console.log(post_data, "::::post_data");
				// return false;

				$('label.error').remove();
			}
		}

		if(remove_images_list.length != 0) {
			post_data['remove_images'] = remove_images_list;
		}

		$http({
			url : '/api/v1/event/update/' + id,
			method : 'post',
			data : post_data
		}).success(function(ret_dt) {
			console.log(ret_dt, ":::::ret_dt");
			if(ret_dt.status == 'success') {
				$('.main_error_wrapper').hide();
				$('#message-box-success').show();
				images_list = [];
				gallery_list = [];
				setTimeout(function() {
					location.href = $scope.base_url + 'admin/events';
				}, 1000);

			} else {
				if(typeof ret_dt.message == 'string') {
					$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
					$('.main_error_wrapper').addClass('alert-danger').show();
				} else {

				}
				$('html, body').animate({
					scrollTop : $('.page-content-wrap').offset().top
				}, 'slow');
			}
		});
	}

});

app.controller('BlogCtrl', function($scope, $http, CONFIGS, $timeout, Upload, $compile, $rootScope, $cookies) {
	$scope.page_heading = "Blogs";
	$scope.save_btn_action = 'addBlog';
	$scope.save_btn_text = "Save";
	var link = $scope.base_url + 'admin/blogs/{unique_id}';
	var filter_list = {};

	// $timeout(function() {
	// 	blog_list_table({});
	// }, 500);
	$scope.$on('blogListView', function(event) {
		blog_list_table({});
	});

	$scope.filter_clicked = function(key, $event, event_type, value) {
		if(event_type == 'keyup') {
			$event.stopPropagation();
			$event.preventDefault();
			if($event.keyCode == 13 || $.trim(value) == '') {
				filter_list[key] = $.trim(value);
				if($.trim(value) == '') {
					delete filter_list[key];
				}
				blog_list_table(filter_list);
			}
		} else if(event_type == 'change') {
			filter_list[key] = $.trim(value);
			if($.trim(value) == '') {
				delete filter_list[key];
			}
			blog_list_table(filter_list);
		}
	};

	function blog_list_table(filter_list) {
		var url = '/api/v1/blog';

		var req_data = {};
		req_data['url'] = url;
		req_data['req_list'] = JSON.stringify(["unique_id", "blog_title", "is_active"]);
		req_data['id_link'] = encodeURIComponent(link);
		req_data['filter_list'] = JSON.stringify(filter_list);
		req_data['req_type'] = 'BLOG';

		getTableJson(function(ret_data) {
			console.log(ret_data['aaData']);
			$("#blogs_list").dataTable({
				"bDestroy": true,
				// "bProcessing": true,
			    // "bServerSide": true,
			    "bSortClasses": false,
			    "bAutoWidth": false,
			    "bLengthChange": false,
			    "iDisplayLength": 20,
			    "aaData": ret_data['aaData'],
			    "aoColumns": [
			    	{"bSortable": false, "bSearchable": false}, //uniqueId
			    	{"bSortable": false, "bSearchable": false}, //name
			    	// {"bSortable": false, "bSearchable": false}, //start_date
			    	// {"bSortable": false, "bSearchable": false}, //end_date
			    	{"bSortable": false, "bSearchable": false}, //is_active
			    	// {"bSortable": false, "bSearchable": false}, //type
			    	{"bSortable": false, "bSearchable": false} //active/inactive update
			    ],
			    "fnInitComplete": function(settings, json) {
					var updateStatus = angular.element($('.update_status'));
					updateStatus.bind('click', $scope.statusUpdate);
				}
			});
		}, req_data);

		$("#blogs_list_filter").hide();
	}

	$scope.uploadFiles = function (files) {
        $scope.files = files;
        if (files && files.length) {
            Upload.upload({
                // url: CONFIGS.api_url + 'fileUpload',
                url: '/api/v1/fileUpload',
                method: 'post',
                data: {
                    files: files,
                    type: 'BLOG'
                }
            }).then(function (response) {
                if(response.data.status == 'success') {
                	images_list.push.apply(images_list, response.data.data.images_list);
                	gallery_list.push.apply(gallery_list, response.data.data.gallery_list);
                }
            });
        }
    };

	$scope.addBlog = function() {
		$('label.error').remove();
		var blog_title = $.trim($('#blog_title').val());
		var content = $.trim($('#content').code());
		var fname = $cookies.get('user_first_name');
		var lname = $cookies.get('user_last_name');
		var author_email = $cookies.get('user_email');
		var author_name = fname + ' ' + lname;
		if($.trim(author_name) == '') {
			author_name = 'Admin';
		}
		var is_active = $.trim($('.is_active:checked').val());
		var blog_status = $.trim($('.blog_status:checked').val());
		// var images = files_dt.length != 0 ? files_dt : {};
		var error_msg = {};
		if(blog_title == '') {
			error_msg['#blog_title'] = 'Please enter blog title';
		}

		if($.trim(String(content).replace(/<[^>]+>/gm, '')) == '') {
			error_msg['#content'] = 'Please enter content';
		}

		if(is_active == '' || is_active == undefined) {
			error_msg['#is_active_container'] = 'Please select whether blog is active or inactive';
		}

		if(blog_status == '' || blog_status == undefined) {
			error_msg['#blog_status_container'] = 'Please select blog status';
		}

		console.log(error_msg, "::::error_msg");
		if(Object.keys(error_msg).length != 0) {
			showError(error_msg);
		} else {

			var post_data = {};

			post_data = {
				blog_title : blog_title,
				content : content,
				blog_author_name : author_name,
				blog_author_email : author_email,
				blog_status : blog_status,
				is_active : is_active,
			};

			// if(images_list.length != 0) {
			// 	post_data['images'] = images_list;
			// }

			// if(gallery_list.length != 0) {
			// 	post_data['gallery'] = gallery_list;
			// }

			console.log(post_data, "::::post_data");
			// return false;

			$('label.error').remove();
			$http({
				url : '/api/v1/blog/add',
				method : 'post',
				data : post_data
			}).success(function(ret_dt) {
				if(ret_dt.status == 'success') {
					$('.main_error_wrapper').hide();
					$('#message-box-success').show();
					// images_list = [];
					// gallery_list = [];
					setTimeout(function() {
						location.href = $scope.base_url + 'admin/blogs';
					}, 1000);

				} else {
					if(typeof ret_dt.message == 'string') {
						$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
						$('.main_error_wrapper').addClass('alert-danger').show();
					} else {

					}
					$('html, body').animate({
						scrollTop : $('.page-content-wrap').offset().top
					}, 'slow');
				}
				console.log(ret_dt, "::::ret_dt");
			});
		}
	};

	$scope.$on('editView', function(event, unique_id) {

	    $http({
			url : '/api/v1/blog/?unique_id=' + unique_id,
			method : 'get',
		}).success(function(ret_dt) {
			if(ret_dt.status == 'success') {
				var blog_list = ret_dt.data[0];
				$scope.deactivate = 1;
				$scope.blog_title = blog_list.blog_title;
				$scope.unique_id = unique_id;
				$scope.content = blog_list.content;
				
				$scope.is_active = blog_list.is_active;
				$scope.blog_status = blog_list.blog_status;
				$scope.blog_author_name = blog_list.blog_author_name;
				$scope.blog_author_email = blog_list.blog_author_email;
				// $scope.existing_images = blog_list.images;
				$('#content').code($scope.content);
				$("#content").siblings(".note-editor").find(".note-editable").attr("contenteditable","false");
                if(blog_list.blog_status != 0) {
                    $('.blog_status').attr('disabled', 'disabled');
                }
				$scope.save_btn_action = 'update';
				$scope.save_btn_text = "Update";
			}
		});
	});

	$scope.removeImage = function($event) {
		var image_path = $($event.target).attr('data_path');
		remove_images_list[remove_images_list.length] = remove_images_list;
	};

	$scope.statusUpdate = function($event) {
		var id = $($event.target).closest('.update_status').attr('data_unique_id');
		var attr_rel = $($event.target).closest('.update_status').attr('rel');
		var is_active = attr_rel == 1 ? 0 : 1;

		$scope.update(id, {'is_active' : is_active});
	};


	$scope.update = function(id, post_data) {
		$('label.error').remove();
		if(post_data == undefined) {
			var is_active = $.trim($('.is_active:checked').val());
			var blog_status = $.trim($('.blog_status:checked').val());
			var error_msg = {};
			if(is_active == '' || is_active == undefined) {
				error_msg['#is_active_container'] = 'Please select whether blog is active or inactive';
			}

			if(blog_status == '' || blog_status == undefined) {
				error_msg['#blog_status_container'] = 'Please select blog status';
			}

			console.log(error_msg, "::::error_msg");
			if(Object.keys(error_msg).length != 0) {
				showError(error_msg);
			} else {

				var post_data = {};

				post_data = {
					is_active : is_active,
					blog_status : blog_status,
				};

				// if(images_list.length != 0) {
				// 	post_data['images'] = images_list;
				// }

				// if(gallery_list.length != 0) {
				// 	post_data['gallery'] = gallery_list;
				// }

				console.log(post_data, "::::post_data");
				// return false;

				$('label.error').remove();
			}
		}

		// if(remove_images_list.length != 0) {
		// 	post_data['remove_images'] = remove_images_list;
		// }

		$http({
			url : '/api/v1/blog/update/' + id,
			method : 'put',
			data : post_data
		}).success(function(ret_dt) {
			console.log(ret_dt, ":::::ret_dt");
			if(ret_dt.status == 'success') {
				$('.main_error_wrapper').hide();
				$('#message-box-success').show();
				// images_list = [];
				// gallery_list = [];
				setTimeout(function() {
					location.href = $scope.base_url + 'admin/blogs';
				}, 1000);

			} else {
				if(typeof ret_dt.message == 'string') {
					$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
					$('.main_error_wrapper').addClass('alert-danger').show();
				} else {

				}
				$('html, body').animate({
					scrollTop : $('.page-content-wrap').offset().top
				}, 'slow');
			}
		});
	}

});

app.controller('CMSCtrl', function($scope, $http, CONFIGS, $timeout, Upload, $compile, $rootScope, $cookies) {
	$scope.page_heading = "CMS";
	$scope.save_btn_action = 'addCMS';
	$scope.save_btn_text = "Save";
	var link = $scope.base_url + 'admin/cms/{unique_id}';
	var filter_list = {};


	// $timeout(function() {
	// 	blog_list_table({});
	// }, 500);
	$scope.$on('cmsListView', function(event) {
		cms_list_table({});
	});

	$(document).on('change', '#list_content_type', function(ev) {
		ev.preventDefault();
		cms_list_table({});

	});

	$scope.filter_clicked = function(key, $event, event_type, value) {
		if(event_type == 'keyup') {
			$event.stopPropagation();
			$event.preventDefault();
			if($event.keyCode == 13 || $.trim(value) == '') {
				filter_list[key] = $.trim(value);
				if($.trim(value) == '') {
					delete filter_list[key];
				}
				cms_list_table(filter_list);
			}
		} else if(event_type == 'change') {
			filter_list[key] = $.trim(value);
			if($.trim(value) == '') {
				delete filter_list[key];
			}
			cms_list_table(filter_list);
		}
	};

	function cms_list_table(filter_list) {
		var url = '/api/v1/cms';
		var content_type = $('#list_content_type').val();

		var req_data = {};
		req_data['url'] = url;
		req_data['req_list'] = JSON.stringify(["unique_id", "title", "is_active"]);
		req_data['id_link'] = encodeURIComponent(link);
		req_data['filter_list'] = JSON.stringify(filter_list);
		req_data['req_type'] = 'CMS';
		req_data['content_type'] = content_type;

		getTableJson(function(ret_data) {
			console.log(ret_data['aaData']);
			$("#cms_list").dataTable({
				"bDestroy": true,
				// "bProcessing": true,
			    // "bServerSide": true,
			    "bSortClasses": false,
			    "bAutoWidth": false,
			    "bLengthChange": false,
			    "iDisplayLength": 20,
			    "aaData": ret_data['aaData'],
			    "aoColumns": [
			    	{"bSortable": false, "bSearchable": false}, //uniqueId
			    	{"bSortable": false, "bSearchable": false}, //name
			    	// {"bSortable": false, "bSearchable": false}, //start_date
			    	// {"bSortable": false, "bSearchable": false}, //end_date
			    	{"bSortable": false, "bSearchable": false}, //is_active
			    	// {"bSortable": false, "bSearchable": false}, //type
			    	{"bSortable": false, "bSearchable": false} //active/inactive update
			    ],
			    "fnInitComplete": function(settings, json) {
					var updateStatus = angular.element($('.update_status'));
					updateStatus.bind('click', $scope.statusUpdate);
				}
			});
		}, req_data);

		$("#cms_list_filter").hide();
	}

	$scope.uploadFiles = function (files, is_bg_img) {
        $scope.files = files;
        if (files && files.length) {
            Upload.upload({
                // url: CONFIGS.api_url + 'fileUpload',
                url: '/api/v1/fileUpload',
                method: 'post',
                data: {
                    files: files,
                    type: 'CMS'
                }
            }).then(function (response) {
                if(response.data.status == 'success') {
                	var updated_gallery_list = response.data.data.gallery_list;
                	if(is_bg_img == 1) {
                		updated_gallery_list = response.data.data.gallery_list.map(function(curr_ele) {
                			curr_ele.is_bg_img = 1;
                			return curr_ele;
                		});
                		bg_images_list.push.apply(bg_images_list, response.data.data.images_list);
                	} else {
                		images_list.push.apply(images_list, response.data.data.images_list);
                	}
                	gallery_list.push.apply(gallery_list, updated_gallery_list);
                }
            });
        }
    };

	$scope.addCMS = function() {
		$('label.error').remove();
		var title = $.trim($('#title').val());
		var content_type = $.trim($('#content_type').val());
		var content = $.trim($('#content').code());
		var fname = $cookies.get('user_first_name');
		var lname = $cookies.get('user_last_name');
		var author_email = $cookies.get('user_email');
		var author_name = fname + ' ' + lname;
		if($.trim(author_name) == '') {
			author_name = 'Admin';
		}
		var is_active = $.trim($('.is_active:checked').val());
		// var images = files_dt.length != 0 ? files_dt : {};
		var error_msg = {};
		if(title == '') {
			error_msg['#title'] = 'Please enter title';
		}

		if($.trim(String(content).replace(/<[^>]+>/gm, '')) == '') {
			error_msg['#content'] = 'Please enter content';
		}

		if(is_active == '' || is_active == undefined) {
			error_msg['#is_active_container'] = 'Please select whether status is active or inactive';
		}

		console.log(error_msg, "::::error_msg");
		if(Object.keys(error_msg).length != 0) {
			showError(error_msg);
		} else {

			var post_data = {};

			post_data = {
				title : title,
				content : content,
				is_active : is_active,
				content_type : content_type,
			};

			if(images_list.length != 0) {
				post_data['images'] = images_list;
			}

			if(bg_images_list.length != 0) {
				post_data['bg_images'] = bg_images_list;
			}

			if(gallery_list.length != 0) {
				post_data['gallery'] = gallery_list;
			}

			console.log(post_data, "::::post_data");
			// return false;

			$('label.error').remove();
			$http({
				url : '/api/v1/cms/add',
				method : 'post',
				data : post_data
			}).success(function(ret_dt) {
				if(ret_dt.status == 'success') {
					$('.main_error_wrapper').hide();
					$('#message-box-success').show();
					images_list = [];
					bg_images_list = [];
					gallery_list = [];
					setTimeout(function() {
						location.href = $scope.base_url + 'admin/cms';
					}, 1000);

				} else {
					if(typeof ret_dt.message == 'string') {
						$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
						$('.main_error_wrapper').addClass('alert-danger').show();
					} else {

					}
					$('html, body').animate({
						scrollTop : $('.page-content-wrap').offset().top
					}, 'slow');
				}
				console.log(ret_dt, "::::ret_dt");
			});
		}
	};

	$scope.$on('editView', function(event, unique_id) {

		var search_qry = location.search.replace('?', '');

	    $http({
			url : '/api/v1/cms/?unique_id=' + unique_id + '&' + search_qry,
			method : 'get',
		}).success(function(ret_dt) {
			if(ret_dt.status == 'success') {
				var cms_list = ret_dt.data[0];
				$scope.deactivate = 1;
				$scope.title = cms_list.title;
				$scope.content_type = cms_list.content_type;
				$scope.short_description = cms_list.short_description;
				$scope.unique_id = unique_id;
				$scope.content = cms_list.content;
				
				$scope.is_active = cms_list.is_active;
				$scope.existing_images = cms_list.images;
				$scope.existing_bg_images = cms_list.bg_images;
				$('#content').code($scope.content);
				// console.log('111111111111111111111');
				// $scope.changeContentType();
				// $("#content").siblings(".note-editor").find(".note-editable").attr("contenteditable","false");
				$scope.save_btn_action = 'update';
				$scope.save_btn_text = "Update";
			}
		});
	});

	$scope.removeImage = function($event) {
		var image_path = $($event.target).attr('data_path');
		remove_images_list[remove_images_list.length] = remove_images_list;
	};

	$scope.statusUpdate = function($event) {
		var id = $($event.target).closest('.update_status').attr('data_unique_id');
		var content_type = $($event.target).closest('.update_status').attr('data_content_type');
		var attr_rel = $($event.target).closest('.update_status').attr('rel');
		var is_active = attr_rel == 1 ? 0 : 1;

		$scope.update(id, {'is_active' : is_active, 'content_type' : content_type});
	};


	$scope.update = function(id, post_data) {
		$('label.error').remove();
		if(post_data == undefined) {
			var is_active = $.trim($('.is_active:checked').val());
			var short_description = $.trim($('#short_description').val());
			var content = $.trim($('#content').code());
			var error_msg = {};
			if(is_active == '' || is_active == undefined) {
				error_msg['#is_active_container'] = 'Please select whether status is active or inactive';
			}

			console.log(error_msg, "::::error_msg");
			if(Object.keys(error_msg).length != 0) {
				showError(error_msg);
			} else {

				var post_data = {};
				var content_type = $('#content_type_hidden').val();

				post_data = {
					is_active : is_active,
					short_description : short_description,
					content : content,
					content_type : content_type,
				};

				if(images_list.length != 0) {
					post_data['images'] = images_list;
				}

				if(bg_images_list.length != 0) {
					post_data['bg_images'] = bg_images_list;
				}

				if(gallery_list.length != 0) {
					post_data['gallery'] = gallery_list;
				}

				console.log(post_data, "::::post_data");
				// return false;

				$('label.error').remove();
			}
		}

		if(remove_images_list.length != 0) {
			post_data['remove_images'] = remove_images_list;
		}

		$http({
			url : '/api/v1/cms/update/' + id,
			method : 'put',
			data : post_data
		}).success(function(ret_dt) {
			console.log(ret_dt, ":::::ret_dt");
			if(ret_dt.status == 'success') {
				$('.main_error_wrapper').hide();
				$('#message-box-success').show();
				images_list = [];
				bg_images_list = [];
				gallery_list = [];
				setTimeout(function() {
					location.href = $scope.base_url + 'admin/cms';
				}, 1000);

			} else {
				if(typeof ret_dt.message == 'string') {
					$('.main_error_wrapper').find('#error_container').text(ret_dt.message);
					$('.main_error_wrapper').addClass('alert-danger').show();
				} else {

				}
				$('html, body').animate({
					scrollTop : $('.page-content-wrap').offset().top
				}, 'slow');
			}
		});
	}

	$scope.changeContentType = function() {
		console.log('2222222222222222222222222222222');
		var rel = $('#content_type').find('option:selected').attr('rel');
		$('.show_on_others').hide();
		if(rel == 'others') {
			$('.show_on_others').show();
		}
	}

});

function showError(error_list) {
	for(var j in error_list) {
		if($(j).parent('div').find('.error').length != 0) {
			$(j).parent('div').find('.error').remove();
		}
		$('<label class="error">' + error_list[j] + '</label>').insertAfter($(j)).show();
	}

	if($('.page-content-wrap').length != 0) {
		$('html, body').animate({
			scrollTop : $('.page-content-wrap').offset().top
		}, 'slow');
	} else {
		$('html, body').animate({
			scrollTop : 0
		}, 'slow');
	}
}
