$(document).ready(

function()
{
  //start at "Instructor"
  var DOMLocation = 14;

  //whether or not "Instructor" is present in column headings
  var instructorsPresent = $(".datadisplaytable").children().children().children().eq(DOMLocation).text().indexOf("Instructor") > -1;

  //number of instructor rows in table
  var numRows = $(".datadisplaytable").children().children().length-2;

  //string replacement variable
  var trimmedName = "";
  //json text of instructor names
  var instructors = [];

  if(instructorsPresent)
  {
    //DOM location set to first instructor cell
    DOMLocation = 31;

    for(i = 0; i < numRows; i++)
    {
      //split instructor cell text & push only instructor name to instructors array
      trimmedName = $(".datadisplaytable").children().children().children().eq(DOMLocation).text().split(/[(]+/);
      instructors.push( trimmedName[0] );
      DOMLocation += 17;
    }

    //send JSON.stringify(the array) as message for processing, to listener in background (sends actual request to server)



    //reset DOM location for data processing
    DOMLocation = 14;

    //append "Rating" column heading after "Instructor" heading
    $(".datadisplaytable").children().children().children().eq(DOMLocation).after("<th class='ddheader' scope='col'><abbr title='Rating'>Rating</abbr></th>");
    DOMLocation += 18;

    for(i = 0; i < numRows; i++)
    {
      //append (specified text) after appropriate instructor cell
      $(".datadisplaytable").children().children().children().eq(DOMLocation).after("<td class='dddefault'>"+instructors[i]+"</td>");

      //increment DOM element index to position of instructor cell of next row
      DOMLocation += 18;
    }
  }
}

/*
//logic for getting a Rate my Professor page and rating.
function getRating(profName)
{

   var httpInfo =
   {
     method: 'GET',
     action: 'xhttp',
     url: 'http://www.ratemyprofessors.com/search.jsp?queryBy=schoolId&schoolName=Georgia+Gwinnett+College&schoolID=12000&queryoption=TEACHER',
     profName: profName
   };

   chrome.runtime.sendMessage(httpInfo, function(data)
   {
     var responseData, profName, rating;
     try
     {
        responseData = data.responseData;
        profName = data.profName;


     }
     catch(err)
     {
       alert("Chrome.runtime.sendMessage error, Check httpInfo variable");
     }
   }
}
*/
);
