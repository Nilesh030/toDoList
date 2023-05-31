//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://nileshkumardawn04:Nilesh123.@todolist.th5y4kt.mongodb.net/toDoListDb",{useNewUrlParser:true});

const itemsSchema={
  name: String
}

const Item= mongoose.model("Item",itemsSchema);

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List", listSchema);

const item1= new Item(
  {
    name: "ItemA"
  }
);

const item2= new Item(
  {
    name: "ItemB"
  }
);

const item3= new Item(
  {
    name: "ItemC"
  }
);
const allItems= [ item1, item2, item3 ];
//console.log(foundItems[0].name);
app.get("/", function(req, res) {
  Item.find().then((foundItems)=>
  {
    if(foundItems.length==0)
    {
      Item.insertMany(allItems);
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName",function(req,res)
{
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function(foundList)
  {
    if(!foundList)
    {
      const list=new List(
        {
          name : customListName,
          items : allItems
        });
        list.save();
        res.redirect("/"+customListName);
    }
    else
    {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
    
});
app.post("/", function(req, res){
  const item= new Item(
    {
      name: req.body.newItem
    });
    if(req.body.list=="Today")
    {
      item.save();
      res.redirect("/");
    }
    else
    {
      List.findOne({name:req.body.list}).then(function(foundList)
        {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+foundList.name);
        }
        );
    }
  
});

app.post("/delete", function(req, res){
  if(req.body.listName=="Today")
  {
    Item.findByIdAndRemove(req.body.checkbox).then(function(err)
  {
    res.redirect("/");
  });
  }
  else
  {
    List.findOneAndUpdate(
      {name:req.body.listName},
      {$pull:{items:{_id:req.body.checkbox}}}
    ).then(function(err)
    {
      res.redirect("/"+req.body.listName);
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
