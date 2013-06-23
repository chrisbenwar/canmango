'use strict';
var canmango = canmango || {};

(function(cm) {
	angular.module('canmango.controllers', []).
	
		controller('HomeCtrl', function($scope) {

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
})(canmango);
