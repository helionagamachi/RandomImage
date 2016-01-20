angular.module('services', []).factory('state', function(){
  var state = {
    lines: 300,
    columns: 300,
    variance: 3,
    randomChance: 0.0001,
    processing: false
  }
  return state;
});

angular.module("randomImage", ['services'])
.controller("InputController", ["$scope", "state", function($scope, state){
  $scope.state = state;
  $scope.validateInt = function(key){
    $scope.state[key] = parseInt($scope.state[key]) || 0;
  }
  $scope.validateFloat = function(key){
    $scope.state[key] = parseFloat($scope.state[key]) || 0.0;
  }
  $scope.start = function(){
    $scope.state.processing = true;
  }
}])
.controller("CanvasController", ["$scope", "state", function($scope, state){
  // initialization
  $scope.state = state;
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  
  $scope.$watch('state.processing', function(processing){
    if(processing) {
      var worker = new Worker("js/line-worker.js");
      worker.onmessage = function(message) {
        var messageType = message.data.type;
        if (messageType == 'data'){
          context.putImageData(message.data.imageData, message.data.x, message.data.y)
        } else if(messageType == 'end') {
          $scope.$apply(function(){
            $scope.state.processing = false;
          });
        }
      }
      worker.postMessage($scope.state);
    }
  });

  
}])
;