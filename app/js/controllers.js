'use strict';
var canmango = canmango || {};

(function(cm) {
	var canmangoControllers = angular.module('canmango.controllers', []);
	
	
	canmangoControllers.controller('HomeCtrl', function($scope) {

			var drawer = cm.roundDude;
			cm.shapespasm.setDrawer(drawer);

			$scope.$on('$viewContentLoaded', canmango.shapespasm.init);

			var displayData = cm.roundDude.getDisplayData();
			$scope.displayData = displayData;
			$scope.selectedItem = displayData[0];

			$scope.update = function() {
				cm.roundDude.update($scope.selectedItem);
			}
  });

	canmangoControllers.controller('ShapinSafariCtrl', function($scope) {
			$scope.$on('$viewContentLoaded', canmango.shapinSafari.init());
	});

	canmangoControllers.controller('RoomCtrl', function($scope) {
			$scope.$on('$viewContentLoaded', canmango.room.init());
	});
})(canmango);
