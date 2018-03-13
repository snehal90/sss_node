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
			// console.log(ret_dt, ":::ret_dt");
			if(ret_dt.status == 'success') {
				$scope.upcoming_events_list = ret_dt.data;
				console.log($scope.upcoming_events_list, ":::$scope.upcoming_events_list");
				console.log(typeof($scope.upcoming_events_list), "::: type of $scope.upcoming_events_list");
			}
		});
	});

	$scope.event_type_change = function(event_type) {
		console.log(CONFIGS.api_url + 'events?type=' + event_type + '&limit=20&is_active=1&sort="{start_date:-1}"', "::::::::::::::::::::::::::::::::::::::::::::::::::url");
		$http({
			url : CONFIGS.api_url + 'events?type=' + event_type + '&limit=20&is_active=1&sort="{start_date:-1}"',
			method : 'get',
		}).success(function(ret_dt) {
			console.log(ret_dt, ":::ret_dt");
			if(ret_dt.status == 'success') {
				$scope.upcoming_events_list = ret_dt.data;
				console.log($scope.upcoming_events_list, ":::$scope.upcoming_events_list");
			}
		});
	}
});