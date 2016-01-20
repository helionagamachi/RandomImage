var previous = false;

function getRandomInt(min, max, includeMax) {
  includeMax = includeMax || 0;
  return Math.floor(Math.random() * (max - min + includeMax)) + min;
}

function LineGenerator(length, randomChance, variance){
  var previous = false;
  this.nextLine = function(){
    var result = new Uint8ClampedArray(length * 4);
    for (var pixelIndex = 0; pixelIndex < length; pixelIndex++) {
      var useRandom = false;
      if (pixelIndex == 0 && previous == false) {
        useRandom = true;
      } else {
        useRandom = Math.random() <= randomChance;
      }
      for (var channel = 0; channel < 4; channel++) {
        var channelValue;
        var index = pixelIndex * 4 + channel;
        if (channel == 3) {
          channelValue = 255;
        } else {
          if (useRandom) {
            channelValue = Math.floor(Math.random() * 256);
          } else {
            var previousValues = [];
            
            if (pixelIndex > 0) {
              previousValues.push(result[index - 4]);
            }
            
            if (previous != false){
              if(pixelIndex > 0){
                previousValues.push(previous[index - 4]);
              }
              previousValues.push(previous[index]);
              if (pixelIndex < length - 1) {
                previousValues.push(previous[index + 4]);
              }
            }
            var mean = previousValues.reduce(function(prev, cur){
              return prev + cur;
            }, 0) / previousValues.length;
            var min = Math.max(mean - variance, 0);
            var max = Math.min(mean + variance, 255);
            channelValue = getRandomInt(min, max, 1);
          }
        }
        result[index] = channelValue;
      }
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