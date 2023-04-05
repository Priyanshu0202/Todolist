const express= require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine",'ejs');   //from ejs template docs to read something from view folder

mongoose.connect("mongodb+srv://admin-priyanshu:mW1wjcmjBEFY20Hb@cluster0.qmh37xl.mongodb.net/todolistDB");

const itemsSchema= new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to your todolist!"
});

const item2 = new Item({
    name:"Hit the + button to add a new item."
});

const item3 = new Item ({
    name:"<-- Hit this t delete an item."
});

const defaultItems= [item1,item2,item3];

const listSchema ={
    name:String,
    items:[itemsSchema]
};

const List =mongoose.model("List", listSchema)

app.get("/",function(req,res){

    Item.find().then(function(founditems){
        if(founditems.length===0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Success")
            }).catch(function(error){
                console.log(error)
            });
        res.redirect("/");
        }
        else{
            res.render("list",{listTitle:"Today", newlistitems:founditems});
        }
        
    }).catch(function(error){
        console.log(error)
    });
  
});

app.post("/",function(req,res){

    const itemName=req.body.newItem;
    const listName=req.body.list;

    const item = new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");  
    }else{
        List.findOne({name:listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        }).catch(function(error){
            console.log(error)
        })
    }

})
app.post("/delete", function(req,res){
    const checkeditemID =req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkeditemID).then(function(){
            console.log("Successfully deleted")
        }).catch(function(error){
            console.log(error);
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemID}}}).then(function(foundList){
            res.redirect("/"+listName);
        }).catch(function(error){
            console.log(error)
        })
        
    }
});

app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
        if(!foundList){
            const list = new List({
                name:customListName,
                items: defaultItems
            });
            
            list.save();
            res.redirect("/"+customListName);
        }else{
            res.render("list",{listTitle:foundList.name, newlistitems:foundList.items});
        }        
    }).catch(function(error){
        console.log(error)
    });
});

app.get("/about", function(req,res){
    res.render("about");
})

app.listen(3000,function(){
    console.log("server is up and running on port 3000!")
})
