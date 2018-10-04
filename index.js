'use strict';

var staticMatch = require('css-mediaquery').match;

// our fake MediaQueryList
function Mql(query, values, forceStatic, targetWindow){
  var self = this;
  var currentWindow = targetWindow || window;
  var dynamicMatch = typeof currentWindow !== 'undefined' ? currentWindow.matchMedia : null;

  if(dynamicMatch && !forceStatic){
    var mql = dynamicMatch.call(currentWindow, query);
    this.matches = mql.matches;
    this.media = mql.media;
    // TODO: is there a time it makes sense to remove this listener?
    mql.addListener(update);
  } else {
    this.matches = staticMatch(query, values);
    this.media = query;
  }

  this.addListener = addListener;
  this.removeListener = removeListener;
  this.dispose = dispose;

  function addListener(listener){
    if(mql){
      mql.addListener(listener);
    }
  }

  function removeListener(listener){
    if(mql){
      mql.removeListener(listener);
    }
  }

  // update ourselves!
  function update(evt){
    self.matches = evt.matches;
    self.media = evt.media;
  }

  function dispose(){
    if(mql){
      mql.removeListener(update);
    }
  }
}

function matchMedia(query, values, forceStatic, targetWindow){
  return new Mql(query, values, forceStatic, targetWindow);
}

module.exports = matchMedia;
