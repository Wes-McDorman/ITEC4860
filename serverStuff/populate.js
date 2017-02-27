var dictionary = {},
    rmp = require("rmp-api"),
    list = ["Paul Lynch ","Cengiz Gunay ","Cegniz Gunay ","Richard Price ",
            "Richard Price ", "James Lowry ", "Adam Smith ","Norris Hughes ",
            "Theresa Peterman ", "Ana Posada ","Michael Kirberger ","Juliet D'Souza",
            "Ali Kooti"],
    itemsProcessed = 0;

var callback = function(professor)
{
  if(professor !== null)
  {
    var info = [professor.fname + " " + professor.lname, 
                professor.university,
                professor.quality,
                professor.easiness,
                professor.help,
                professor.grade,
                professor.chili,
                professor.url,
                professor.comments[0]];
    dictionary[info[0]] = info;
  }
  itemsProcessed++;
  if(itemsProcessed === list.length)
  {
    console.log("OPERATION COMPLETE");
    //printList();
  }
}

function printList()
{
  for (var key in dictionary) 
  {
    if (dictionary.hasOwnProperty(key)) 
    {
      console.log(key + " -> " + JSON.stringify(dictionary[key]));
    }
  }
}

function loadList(profList)
{
  for(i = 0; i < profList.length; i++)
  {
    rmp.get(profList[i], callback);
  }
}

loadList(list);