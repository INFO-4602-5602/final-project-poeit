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
  } );
} );

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

    loadPoemInfo(selectedAuthor, selectedPoem);
  } );
}

// loads basic information of selected poem
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
