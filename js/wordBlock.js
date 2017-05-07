// D3 script for creating word block representations of poem

d3.json( "data/dickinson.json", function( error, data ){
  const poemData = data[0];
  const lines    = data[0].lines;
  let wordData   = [];

  const width     = 400;
  const height    = _.size(lines) * 25;
  const barHeight = 15;
  const barWidth  = 50;

  // creates word data object consisting of word arrays per line
  _.forEach( lines, function( line ){
    wordData.push( line.split(" ") )
  } );

  let svg = d3.select( '#wordBlock' ).append( 'svg:svg' )
                                     .attr( 'width', width )
                                     .attr( 'height', height );

  let wordBlock = svg.selectAll( '.block' ).data( wordData );
  wordBlock.enter().append( 'svg:rect' )
                   .attr( 'class', 'word-block-1' )
                   .attr( 'x', 10 )
                   .attr( 'y', 10 )
                   .attr( 'height', barHeight )
                   .attr( 'width', barWidth );


} )
