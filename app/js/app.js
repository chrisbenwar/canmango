'use strict';


// Declare app level module which depends on filters, and services
var canmangoApp = angular.module('canmango', [
		'canmango.filters', 
		'canmango.services', 
		'canmango.directives', 
		'canmango.controllers'
]);

canmangoApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', 
		{templateUrl: 'partials/home.html', controller: 'HomeCtrl'}
	);

	$routeProvider.when('/round-dudes', 
		{templateUrl: 'partials/round-dudes.html', controller: 'HomeCtrl'}
	);

	$routeProvider.when('/shape-shifters', 
		{templateUrl: 'partials/shape-shifters.html', controller: 'HomeCtrl'}
	);

	$routeProvider.when('/shapin-safari', 
		{templateUrl: 'partials/shapin-safari.html', controller: 'ShapinSafariCtrl'}
	);

	$routeProvider.otherwise({redirectTo: '/home'});
}]);
