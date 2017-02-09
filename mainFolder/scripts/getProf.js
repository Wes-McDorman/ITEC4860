$(document).ready(

function()
{
  //start at "Instructor"
  var DOMLocation = 14;
  
  //whether or not "Instructor" is present in column headings
  var instructorsPresent = $(".datadisplaytable").children().children().children().eq(DOMLocation).text().indexOf("Instructor") > -1;
  
  //number of instructor rows
  var numElements = $(".datadisplaytable").children().children().length-2;

  if(instructorsPresent)
  {
    //append "Rating" column heading after "Instructor" heading
    $(".datadisplaytable").children().children().children().eq(DOMLocation).after("<th class='ddheader' scope='col'><abbr title='Rating'>Rating</abbr></th>");
    DOMLocation += 18;
    
    //iterate through remaining elements based on number of instructors present
    for(i = 0; i < numElements; i++)
    { 
      //append (specified text) after appropriate instructor cell
      $(".datadisplaytable").children().children().children().eq(DOMLocation).after("<td class='dddefault'>RMPDATAGET</td>");
      
      //increment DOM element index to position of instructor cell of next row
      DOMLocation += 18;
    }
  }
}

);