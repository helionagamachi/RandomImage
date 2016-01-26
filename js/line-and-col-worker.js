function getRandomInt(min, max, includeMax) {
  includeMax = includeMax || 0;
  return Math.floor(Math.random() * (max - min + includeMax)) + min;
}

function LineGenerator(initialPixel, randomChance, variance){
  var previous = initialPixel;

  function getValueBasedOnNeighbours(pixelIndex, index, length, result){
    var neighbours = [];
    if (pixelIndex == 0) {
      neighbours.push(previous[index]);
    } else {
      neighbours.push(result[index - 4]);
      neighbours.push(previous[index - 4]);
    }

    var mean = neighbours.reduce(function(prev, cur){
      return prev + cur;
    }, 0) / neighbours.length;
    // mean = Math.round(mean);
    var min = Math.max(mean - variance, 0);
    var max = Math.min(mean + variance, 255);
    return getRandomInt(min, max, 1);
  }

  this.nextLine = function(length){
    var result = new Uint8ClampedArray(length * 4);
    var pixelIndex = 0;
    if (length == 2) {
      result[0] = previous[0];
      result[1] = previous[1];
      result[2] = previous[2];
      result[3] = previous[3];
      pixelIndex = 1;
    }
    while (pixelIndex < length) {
      var useRandom = Math.random() <= randomChance;
      var index = pixelIndex * 4;
      if (useRandom) {
        result[index] = getRandomInt(0, 255, 1);
        result[index + 1 ] = getRandomInt(0, 255, 1);
        result[index + 2] = getRandomInt(0, 255, 1);
      } else {
        result[index] = getValueBasedOnNeighbours(pixelIndex, index, length, result);
        result[index + 1] = getValueBasedOnNeighbours(pixelIndex, index + 1, length, result);
        result[index + 2] = getValueBasedOnNeighbours(pixelIndex, index + 2, length, result);
      }
      result[index + 3] = 255;
      pixelIndex = pixelIndex + 1;
    } // while pixelIndex < length
    previous = result;
    
      if (length == 2) {
        console.log('hi!');
        console.log(result);
      }
    return result;
  } // this.nextLine = function(length)


}

onmessage = function(msg){
  console.log(JSON.stringify(msg.data));
  // setup the initial pixel and send to the main thread
  var initialPixel = new Uint8ClampedArray(4);
  initialPixel[0] = getRandomInt(0, 255, 1);
  initialPixel[1] = getRandomInt(0, 255, 1);
  initialPixel[2] = getRandomInt(0, 255, 1);
  initialPixel[3] = 255;

  var imageData = new ImageData(initialPixel, 1, 1);
  var response = {
      x: 0,
      y: 0,
      imageData: imageData,
      type: 'data'
    };
  postMessage(response);
  var lineGenerator = new LineGenerator(initialPixel, msg.data.randomChance, msg.data.variance);
  var columnGenerator = new LineGenerator(initialPixel, msg.data.randomChance, msg.data.variance);

  for (var index = 1; index < msg.data.columns; index++){
    imageData = new ImageData(columnGenerator.nextLine(index + 1), 1, index + 1);
    var response = {
      x: index,
      y: 0,
      imageData: imageData,
      type:'data'
    }
    postMessage(response);
    imageData = new ImageData(lineGenerator.nextLine(index + 1), index+1 , 1);
    response.x = 0;
    response.y = index;
    response.imageData = imageData;
    postMessage(response);
  }

  postMessage({type:'end'});
  close();
}
