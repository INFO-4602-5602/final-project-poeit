// D3 script for creating word block representations of poem

d3.json( "data/whitman.json", function( error, data ){
  const poemData = data[0];
  const lines    = data[0].lines;
  let wordData   = [];

  const width     = 800;
  const height    = _.size(lines) * 25;
  const barHeight = 15;
  const barWidth  = 30;

  // creates word data object consisting of word arrays per line
  _.forEach( lines, function( line ){
    wordData.push( line.split(" ") )
  } );

  var yScale = d3.scale.ordinal()
                 .domain( wordData )
                 .rangeRoundBands([0, height], .6);

  let svg = d3.select( '#wordBlock' ).append( 'svg:svg' )
                                     .attr( 'width', width )
                                     .attr( 'height', height );

  _.forEach( wordData, function( line ){
      let wordBlock = svg.selectAll( '.block' ).data( line );

      wordBlock.enter().append( 'svg:rect' )
                       .attr( 'class', 'word-block-1' )
                       .attr( 'x', function( word, wordIndex ){
                         return (wordIndex * 35)
                       } )
                       .attr( 'y', function(){
                         return yScale(line);
                       } )
                       .attr( 'height', barHeight )
                       .attr( 'width', barWidth );
  } );


} )
