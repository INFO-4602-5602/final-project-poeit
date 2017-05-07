// D3 script for creating word block representations of poem

d3.json( "data/whitman.json", function( error, data ){
  const poemData = data[0];
  const lines    = data[0].lines;
  let wordData   = [];

  const width     = 800;
  const height    = _.size(lines) * 35;
  const barHeight = 15;
  const barWidth  = 30;

  // creates word data object consisting of word arrays per line
  _.forEach( lines, function( line ){
    wordData.push( line.split(" ") )
  } );

  var yScale = d3.scale.ordinal()
                 .domain( wordData )
                 .rangeRoundBands([0, height + 10], .5);

  let svg = d3.select( '#wordBlock' ).append( 'svg:svg' )
                                     .attr( 'width', width )
                                     .attr( 'height', height );

  // iterates through each line of poem & represents each word
  // as one block
  _.forEach( wordData, function( line ){
      let wordBlock = svg.selectAll( '.block' ).data( line );

      let tooltip = wordBlock.enter().append( 'svg:text' )
                                     .attr( 'fill', '#606060' )
                                     .attr( 'font-family', 'Open Sans')
                                     .attr( 'font-size', '12' )
                                     .attr( 'stroke', 'none' )
                                     .attr( 'class', '.word-tooltip' );

      wordBlock.enter().append( 'svg:rect' );
      wordBlock.attr( 'class', 'word-block-1' )
               .attr( 'x', function( word, wordIndex ){
                 return wordIndex * 35
               } )
               .attr( 'y', function(){
                 return yScale(line);
               } )
               .attr( 'height', barHeight )
               .attr( 'width', barWidth )
               .on( 'mouseover', function( word, wordIndex ){
                 tooltip.text( word )
                        .attr( 'x', wordIndex * 35 )
                        .attr( 'y', yScale(line) )
                 return tooltip.style('visibility', 'visible')
               } )
  } );


} )
