// JS for author & poem selection logic

$( document ).ready(function() {
  loadPoems();

  // Builds poem dropdown when author is changed
  $( '#authorDropdown' ).on( 'change', function(){
    loadPoems();
  } );
});

function loadPoems(){
  let authorElement = document.getElementById('authorDropdown');
  let selectedAuthor = authorElement.options[authorElement.selectedIndex].value;

  $.getJSON( 'data/' + selectedAuthor + '.json', function( json ){
    let poemSelectHTML = '';

    _.forEach( json, function(poem){
      const oneWordTitle = _.lowerCase( _.replace( poem.title, ' ', '' ) );
      poemSelectHTML += '<option class="dropdown-item" value="' + oneWordTitle + '">' + poem.title + '</a>';
    } );

    const dropdown = document.getElementById( 'poemDropdown' );
    dropdown.innerHTML = poemSelectHTML
  } )
}
