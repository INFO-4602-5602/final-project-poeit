d3.json( "data/dickinson.json", function( error, data ){
  poemData = data[0];
  title = data[0].title;
  numLines = data[0].linecount;

  console.log(poemData)

  $( '#title' ).append( title );
  $( '#numLines' ).append( numLines );
} )
