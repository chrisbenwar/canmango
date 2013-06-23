'use strict';
var canmango = canmango || {};

(function(cm) {
	angular.module('canmango.controllers', []).
		controller('HomeCtrl', function($scope) {
			var drawer = canmango.roundDude;
			canmango.shapespasm.setDrawer(drawer);
			$scope.$on('$viewContentLoaded', canmango.shapespasm.init);
  });
})(canmango);
