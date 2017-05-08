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

    loadPoemInfo( selectedAuthor, selectedPoem );
    loadWordBlocks( selectedAuthor, selectedPoem );
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
  d3.select("#wordBlockSvg").remove();

  const poemTitle = title;

  d3.json( 'data/' + author + '.json', function( error, data ){
    const poemData = _.find( data, function( poem ){
      return poem.title === poemTitle;
    } );
    const lines = poemData.lines;
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
