d3.json("data/dickinson.json", function(error, data){
    console.log(data)
    $( '#checkData' ).append( '<p>' + data.title + '</p>' )
})
