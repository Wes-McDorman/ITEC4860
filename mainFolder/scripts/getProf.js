$(document).ready(function(){
  var DOMLocation = 14; //start at "instructors"
  var numElements = $(".datadisplaytable").children().children().children().length; //Number of elements


    for(i = 0; i < numElements + 1; i++) { //need to have a way to find out how many instructors were in "datadisplaytable"
      //DOM navigation (look it up)
      $(".datadisplaytable").children().children().children().eq(DOMLocation).css("border", "10px solid red");
      DOMLocation += 17; //continue onto the next instructor box
  }
});
