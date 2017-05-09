// D3 script for displaying basic info of a poem

$( document ).ready( function() {
  loadPoemDropdown();

  // Builds poem dropdown when author is changed
  $( '#authorDropdown' ).on( 'change', function(){
    loadPoemDropdown();
  } );
  $( '#poemDropdown' ).on( 'change', function(){
    let authorElement = document.getElementById('authorDropdown');
    let selectedAuthor = authorElement.options[authorElement.selectedIndex].value;

    let poemElement = document.getElementById('poemDropdown');
    let selectedPoem = poemElement.options[poemElement.selectedIndex].value;

    loadPoemInfo(selectedAuthor, selectedPoem);
    loadWordBlocks( selectedAuthor, selectedPoem );
    loadSyllableGraph( selectedAuthor, selectedPoem );
  } );
} );

/* Loads dropdown list of author's poems */
function loadPoemDropdown(){
  let authorElement = document.getElementById('authorDropdown');
  let selectedAuthor = authorElement.options[authorElement.selectedIndex].value;

  $.getJSON( 'data/' + selectedAuthor + '.json', function( json ){
    let poemSelectHTML = '';

    _.forEach( json, function(poem, index){
      if( index == 0 ){
        // default selected poem to first in dataset
        poemSelectHTML += '<option class="dropdown-item" value="' + poem.title + '" selected="selected">' + poem.title + '</a>';
      }
      else {
        poemSelectHTML += '<option class="dropdown-item" value="' + poem.title + '">' + poem.title + '</a>';
      }
    } );

    document.getElementById( 'poemDropdown' ).innerHTML = poemSelectHTML;

    let poemElement = document.getElementById('poemDropdown');
    let selectedPoem = poemElement.options[poemElement.selectedIndex].value;

    // for the initial page load
    loadPoemInfo( selectedAuthor, selectedPoem );
    loadWordBlocks( selectedAuthor, selectedPoem );
    loadSyllableGraph( selectedAuthor, selectedPoem );
  } );
}

/* Loads basic information of selected poem */
function loadPoemInfo( author, title ){
  let poemTitle = title;

  d3.json( 'data/' + author + '.json', function( error, data ){
    const poemData = _.find( data, function( poem ){
      return poem.title === poemTitle;
    } );

    const title = poemData.title;
    const lines = poemData.lines;
    const numLines = poemData.linecount;
    let   lineLength = 0;
    let   avgLineLength;

    // calculate average length of each line
    _.forEach( lines, function( line ){
      lineLength +=  _.size(line.split(" "));
    } );
    avgLineLength = Math.round( (lineLength / numLines) * 100 ) / 100;

    $( '#title' ).html( title );
    $( '#numLines' ).html( numLines );
    $( '#avgLineLength' ).html( avgLineLength + '<span> words</span>' );
  } );
}

/* Loads word block vis of selected poem */
function loadWordBlocks( author, title ){
  // clears any previous word block SVGs
  d3.select('#wordBlockSvg').remove();

  const poemTitle = title;

  d3.json( 'data/' + author + '.json', function( error, data ){
    const poemData = _.find( data, function( poem ){
      return poem.title === poemTitle;
    } );
    const lines = poemData.lines;
    let wordData   = [];

    const width     = 850;
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
                                       .attr( 'id', 'wordBlockSvg' )
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
  } );
}

/* Loads syllable graph selected poem */
function loadSyllableGraph( author, title ){
  const poemTitle = title;

  d3.json( 'data/' + author + '.json', function( error, data ){
    const poemData = _.find( data, function( poem ){
      return poem.title === poemTitle;
    } );
    const lines      = poemData.lines;
    let wordData     = [];
    let syllableData = [];
    let combinedData = {};

    const width     = 850;
    const height    = 550;
    var xOffset     = 195;
    var yOffset     = 100;
    const barHeight = 15;
    const barWidth  = 30;

    // creates syllable array consisting of syllable counts per line
    _.forEach( lines, function( line ){
      wordArray = line.split(" ");

      lineSyllableLength = 0;
      _.forEach( wordArray, function( word ){
        // strip punctuation
        word = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        lineSyllableLength += countSyllables( word )
      } );

      syllableData.push(lineSyllableLength)
    } );

    // object where keys are poems lines & vals are syllable counts
    combinedData = _.zipObject(lines, syllableData);

    // Create svg to contain vis
    var svg = d3.select( '#syllableGraph' ).append( 'svg:svg' )
                                           .attr( 'width', width )
                                           .attr( 'height', height );

    // Define axes scale
    var xScale = d3.scale.ordinal()
                   .domain( _.keys(combinedData) )
                   .rangePoints([xOffset, width], 0.5);

    var yScale = d3.scale.linear()
                         .domain( [0, d3.max( _.values(combinedData) )+10] )
                         .range( [height - yOffset, 0] );

    // Create axes
    var xAxis = d3.svg.axis()
                      .scale( xScale )
                      .orient( 'bottom' )
                      .ticks( 5 );
    var xAxisG = svg.append( 'g' )
                    .attr( 'class', 'axis' )
                    .attr( 'transform', 'translate(0, ' + (height-yOffset-1) + ')' )
                    .call( xAxis )
                    .selectAll( 'text' )
                      .style( 'text-anchor', 'end' )
                      .attr( 'dx', '-.4em' )
                      .attr( 'dy', '.075em' )
                      .attr( 'transform', function(d) {
                          return 'rotate(-25)'
                      });

    var yAxis = d3.svg.axis()
                      .scale( yScale )
                      .orient( 'left' );
    var yAxisG = svg.append( 'g' )
                    .attr( 'class', 'axis' )
                    .attr( 'transform', 'translate(' + (xOffset) + ')' )
                    .call( yAxis );
    var yLabel = svg.append( 'text' )
                    .attr( 'class', 'label' )
                    .attr( 'transform', 'translate(' + (xOffset/2-90) + ')')
                    .attr( 'y', height/3 )
                    .style( 'font-size', '15px' )
                    .text( 'Number of Syllables' );

    // Create graph line
    // var line = d3.svg.line()
    //                  .x( function( d, i ){ return xScale(_.keys(combinedData)); } )
    //                  .y( function( d ){ return yScale(d); } )
    //                  .interpolate("linear");
    // var lineG = svg.append( 'path' )
    //                .attr( 'class', 'line' )
    //                .attr( 'd', function(d){ return line( combinedData ) } )
    //                .call(line);
  } );
}

function countSyllables( word ){
  if (word.length > 0) {
    word = word.toLowerCase();
    word = word.replace(/(?:[^laeiouy]es|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    word = word.match(/[aeiouy]{1,2}/g);
    return word ? word.length : 1;
  }
  return 0;
}
