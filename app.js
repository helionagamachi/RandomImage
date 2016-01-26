angular.module("randomImage", [])
.factory('state', function(){
  var state = {
    lines: 300,
    columns: 300,
    variance: 3,
    randomChance: 0.0001,
    processing: false,
    method: "lines",
  }
  return state;
})
.factory('methods', function(){
  return {
    "lines": "line-worker",
    "lines and cols": "line-and-col-worker"
  }
})
.controller("InputController", ["$scope", "$rootScope", "state", "methods", function($scope, $rootScope, state, methods){
  $scope.state = state;

  // $scope.$apply(function(){
    $scope.state.methods = Object.keys(methods);
  // })

  $scope.validateInt = function(key){
    $scope.state[key] = parseInt($scope.state[key]) || 0;
  }
  $scope.validateFloat = function(key){
    $scope.state[key] = parseFloat($scope.state[key]) || 0.0;
  }
  $scope.start = function(){
    if (!$scope.state.processing) {
      $scope.state.processing = true;
      $rootScope.$broadcast('start');
    }
  }

  $rootScope.$on('end', function(){
    $scope.state.processing = false;
  });

}])
.controller("CanvasController", ["$scope", "$rootScope", "state", "methods", function($scope, $rootScope, state, methods){
  // initialization
  $scope.state = state;
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");

  $rootScope.$on('start', function(event, args){
    var workerName = methods[$scope.state.method];
    var worker = new Worker("js/" + workerName + ".js");
    worker.onmessage = function(message) {
      var messageType = message.data.type;
      if (messageType == 'data'){
        context.putImageData(message.data.imageData, message.data.x, message.data.y);
      } else if(messageType == 'end') {
        $rootScope.$broadcast('end');
      }
    }
    worker.postMessage($scope.state);
  });

}]);
