d3.json( "data/dickinson.json", function( error, data ){
  const poemData = data[0];
  const title = data[0].title;
  const lines = data[0].lines;
  const numLines = data[0].linecount;
  let   lineLength = 0;
  let   avgLineLength;

  // calculate average length of each line
  _.forEach( lines, function( line ){
    lineLength +=  _.size(line.split(" "));
  } )
  avgLineLength = lineLength / numLines;

  $( '#title' ).append( title );
  $( '#numLines' ).append( numLines );
  $( '#avgLineLength' ).append( avgLineLength );
} )
