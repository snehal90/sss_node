var app1 = angular.module('sss_frontend', ['ui.router', 'sss_master', 'angularCSS', 'config']);
app1.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
	$stateProvider.state('frontend', {
		url: '/',
		// abstract: true,
		templateUrl : '/views/masters/partials/frontend_body.html',
		controller : 'HomeFrontendCtrl',

		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('homeData');
	        })
		}
	}).state('events', {
		url: '/events',
		templateUrl : '/views/frontend/events/events_list.html',
		controller : 'EventsFrontendCtrl',

		onEnter: function($rootScope, $timeout, $stateParams) { 
			$timeout(function() {
	            $rootScope.$broadcast('getEventsList');
	        })
		}
	});
	$locationProvider.html5Mode(true);
}]);

app1.run(function($rootScope, $window, $http, CONFIGS, utilService) {
	$rootScope.is_home = 0;
	$rootScope.base_url = location.origin + '/';
	$rootScope.utilService = utilService;
	$window.addEventListener('load', function() {
		$("#preloader").fadeOut("slow");
	});
});

app1.controller('HomeFrontendCtrl', function($scope, $http, CONFIGS, $rootScope) {
	$rootScope.is_home = 1;
	$scope.$on('homeData', function() {
		$http({
			url : CONFIGS.api_url + 'events?type=upcoming&limit=3&is_active=1&sort="start_date:-1"',
			method : 'get',
		}).success(function(ret_dt) {
			// console.log(ret_dt, ":::ret_dt");
			if(ret_dt.status == 'success') {
				$scope.upcoming_events_list = ret_dt.data;
				console.log($scope.upcoming_events_list, ":::$scope.upcoming_events_list");
				console.log(typeof($scope.upcoming_events_list), "::: type of $scope.upcoming_events_list");
			}
		});

	});

	$scope.moveToEvents = function(upcoming_events_length, event) {
		if(upcoming_events_length == 0) {
			event.preventDefault();
			event.stopPropagation();
			location.href = '/events';
		}
	};
});

app1.controller('EventsFrontendCtrl', function($scope, $http, CONFIGS, $rootScope) {
	$scope.$on('getEventsList', function() {
		$http({
			url : CONFIGS.api_url + 'events?type=upcoming&limit=20&is_active=1&sort="{start_date:-1}"',
			method : 'get',
		}).success(function(ret_dt) {
			if(ret_dt.status == 'success') {
				$scope.upcoming_events_list = ret_dt.data;
				$scope.page_count = ret_dt.meta.page_count;
				$(".scroll_container").attr('data_page', 1);
			}
		});
	});

	$scope.event_type_change = function(event_type) {
		$http({
			url : CONFIGS.api_url + 'events?type=' + event_type + '&limit=20&is_active=1&sort="{start_date:-1}"',
			method : 'get',
		}).success(function(ret_dt) {
			console.log(ret_dt, ":::ret_dt");
			if(ret_dt.status == 'success') {
				$scope.upcoming_events_list = ret_dt.data;
				$scope.page_count = ret_dt.meta.page_count;
				$(".scroll_container").attr('data_page', 1);
				console.log($scope.upcoming_events_list, ":::$scope.upcoming_events_list");
			}
		});
	}

	$scope.paginate_event = function(page, extra_dt) {
		$http({
			url : CONFIGS.api_url + 'events?type=' + extra_dt['event_type'] + '&limit=20&is_active=1&sort="{start_date:-1}"&page=' + page,
			method : 'get',
		}).success(function(ret_dt) {
			if(ret_dt.status == 'success') {
				var upcoming_events_list = $scope.upcoming_events_list;
				for(var i in ret_dt.data) {
					upcoming_events_list[upcoming_events_list.length] = ret_dt.data[i];
				}
				$scope.upcoming_events_list = upcoming_events_list;
				$(".scroll_container").attr('data_page', page);
			}
		});
	}
});

$(window).on('scroll', function() {
	if($('.scroll_container').length != 0 && ($(window).scrollTop() >= $('.scroll_container').offset().top + $('.scroll_container').outerHeight() - window.innerHeight))
    {
    	var scope = angular.element($(".scroll_container")).scope();
    	var page = $(".scroll_container").attr('data_page');
    	var page_count = $(".scroll_container").attr('data_page_count');
    	var page_type = $(".scroll_container").attr('data_page_type');

    	if(page_count >= page) {
	    	page++;
			scope.$apply(function () {
				var extra_dt = {};
				if(page_type == 'event') {
					extra_dt['event_type'] = $('.event_type:checked').val();
				}
			   	scope.paginate_event(page, extra_dt);
			});
    	}
	}
})