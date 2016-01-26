function getRandomInt(min, max, includeMax) {
  includeMax = includeMax || 0;
  return Math.floor(Math.random() * (max - min + includeMax)) + min;
}

function LineGenerator(lineLength, randomChance, variance){
  var previous = false;

  function getValueBasedOnNeighbours(pixelIndex, index, result){
    var neighbours = [];
    if (pixelIndex > 0) {
      neighbours.push(result[index - 4]);
    }
    if (previous != false){
      if(pixelIndex > 0){
        neighbours.push(previous[index - 4]);
      }
      neighbours.push(previous[index]);
      if (pixelIndex < lineLength - 1) {
        neighbours.push(previous[index + 4]);
      }
    }
    var mean = neighbours.reduce(function(prev, cur){
      return prev + cur;
    }, 0) / neighbours.length;
    var min = Math.max(mean - variance, 0);
    var max = Math.min(mean + variance, 255);
    return getRandomInt(min, max, 1);
  }

  this.nextLine = function(){
    var result = new Uint8ClampedArray(lineLength * 4);
    for (var pixelIndex = 0; pixelIndex < lineLength; pixelIndex++) {
      var useRandom = false;
      if (pixelIndex == 0 && previous == false) {
        useRandom = true;
      } else {
        useRandom = Math.random() <= randomChance;
      }
      var index = pixelIndex * 4;
      if (useRandom) {
        //red
        result[index] = Math.floor(Math.random() * 256);
        //blue
        result[index + 1] = Math.floor(Math.random() * 256);
        //green
        result[index + 2] = Math.floor(Math.random() * 256);
      } else {
        //red
        result[index] = getValueBasedOnNeighbours(pixelIndex, index, result);
        //blue
        result[index + 1] = getValueBasedOnNeighbours(pixelIndex, index + 1, result);
        //green
        result[index + 2] = getValueBasedOnNeighbours(pixelIndex, index + 2, result);
      }
      result[index + 3] = 255;
    }
    previous = result;
    return result;
  }
}

onmessage = function(msg){
  var generator = new LineGenerator(msg.data.columns, msg.data.randomChance, msg.data.variance);
  for (var line = 0; line < msg.data.lines; line++) {
    var imageData = new ImageData(generator.nextLine(), msg.data.columns, 1);
    var response = {
      x: 0,
      y: line,
      imageData: imageData,
      type: 'data'
    };
    postMessage(response);
  }
  postMessage({type:'end'});
  close();
}
