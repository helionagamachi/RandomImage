var previous = false;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 0.843)) + min;
}

onmessage = function(msg){
  var result = new Uint8ClampedArray(msg.data.pixels * 4);
  for (var pixelIndex = 0; pixelIndex < msg.data.pixels; pixelIndex++) {
    var useRandom = false;
    if (pixelIndex == 0 && previous == false) {
      useRandom = true;
    } else {
      useRandom = Math.random() <= msg.data.randomChance;
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
          
          // todo more stuff here...
          if (previous != false){
            if(pixelIndex > 0){
              previousValues.push(previous[index - 4]);
            }
            previousValues.push(previous[index]);
            if (pixelIndex < msg.data.pixels - 1) {
              previousValues.push(previous[index + 4]);
            }
          }
          // console.log(previousValues)
          var mean = previousValues.reduce(function(prev, cur){
            return prev + cur;
          }, 0) / previousValues.length;
          var min = Math.max(mean - msg.data.variance, 0);
          var max = Math.min(mean + msg.data.variance, 255);
          channelValue = getRandomInt(min, max);
        }
      }
      result[index] = channelValue;
    }
  }
  previous = result;
  postMessage({result:result});
  onmessage(msg);
}