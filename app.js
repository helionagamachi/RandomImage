angular.module('services', []).factory('state', function(){
  var state = {
    lines: 300,
    columns: 300,
    variance: 3,
    randomChance: 0.0001,
  }
  return state;
});

angular.module("randomImage", ['services'])
.controller("InputController", ["$scope", "state", function($scope, state){
  $scope.state = state;
}])
.controller("CanvasController", ["$scope", "state", function($scope, state){
  // initialization
  $scope.state = state;
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  // var imageData = context.createImageData(state.lines, state.columns);
  // $scope.$watch('state', function(){
  $scope.lol = function(){
    var worker = new Worker("js/line-worker.js");
    worker.onmessage = function(message) {
      
      context.putImageData(message.data.imageData, message.data.x, message.data.y)
    }
    worker.postMessage($scope.state);
  }

  
}])
;