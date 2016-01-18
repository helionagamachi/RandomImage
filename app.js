angular.module('services', []).factory('state', function(){
  var state = {
    lines: 2048,
    columns: 1536,
    variance: 2,
    randomChance: 0.0001,
  }
  return state;
}).factory('randomFunctions', function(){
   var UP = 1,
      RIGHT = 2,
      DOWN = 4,
      LEFT =  8;
  function getMeanFromNeighbours(line, column, channel, imageData, neighbours) {
    var sum = neighbours.reduce(function(previousValue, neighbour){
      var l = line;
      if (neighbour & UP) {
        l = line - 1;
      } else if (neighbour & DOWN) {
        l = line + 1;
      }
      var c = column;
      if (neighbour & RIGHT) {
        c = column + 1;
      } else if (neighbour & LEFT) {
        c = column - 1;
      }
      var value = imageData.data[getIndex(l, c, imageData.width, channel)];
      return previousValue + value;
    }, 0)
    return Math.round(sum / neighbours.length);
  }
  function getIndex(line, column, columns, channel) {
    return ((line * columns) + column) * 4 + channel;
  }
  function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 0.8)) + min;
}
  // random functions
  function lineRandom(state, imageData, context){
    for (var line = 0; line < imageData.height; line++) {
      for (var column = 0; column < imageData.width; column++) {
        var useRandom = Math.random() <= state.randomChance;
        for (var channel = 0; channel < 4; channel++) {
          var index = getIndex(line, column, imageData.width, channel);
          if (channel == 3) {
            imageData.data[index] = 255;
          } else {
            if (useRandom || (line == 0 && column == 0)) {
              imageData.data[index] = Math.floor(Math.random() * 256);
            } else {
              var neighbours = [];
              if (column != 0) {
                neighbours.unshift(LEFT);
              }
              if (line != 0 ) {
                neighbours.unshift(UP);
                if (column != 0) {
                  neighbours.unshift(UP | LEFT);
                }
                if (column != imageData.width - 1) {
                  neighbours.unshift(UP | RIGHT);
                }
              }
              var mean = getMeanFromNeighbours(line, column, channel, imageData, neighbours);
              var min = Math.max(mean - parseInt(state.variance), 0);
              var max = Math.min(mean + parseInt(state.variance), 255);
              imageData.data[index] = getRandomInt(min, max);
            }
          }
        }
      }
    }
    return imageData;
  }
  return {
    line:lineRandom
  };
});

angular.module("randomImage", ['services'])
.controller("InputController", ["$scope", "state", function($scope, state){
  $scope.state = state;
}])
.controller("CanvasController", ["$scope", "state", "randomFunctions", function($scope, state, functions){
  // initialization
  $scope.state = state;
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  // var imageData = context.createImageData(state.lines, state.columns);
  // $scope.$watch('state', function(){
  $scope.lol = function(){
    setTimeout(function(){
      var imageData = context.createImageData($scope.state.columns, $scope.state.lines);
      var i = functions.line($scope.state, imageData);
      context.putImageData(i, 0, 0);
    }, 1)
    
  }  
    
    
    
  // })
  
}])
;