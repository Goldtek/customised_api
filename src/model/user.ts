
const mongoose = require('mongoose'),
schema = mongoose.Schema;

var userSchema = new schema({
    firstname:{type:String,index:true},
    lastname:{type:String,index:true},
    email:{type:String,required:true,index:{unique:true}},
    phoneNumber:String,
    address:{type:String,index:true},
    city:{type:schema.Types.String,ref:'city',index:true},
    state:{type:schema.Types.String,ref:'state',required:true,index:true},
    country:{type:schema.Types.Number,ref:'country',required:true,index:true},
    password: {type:String, required:true},
    photo:{type:String,default:"./assets/images/new.jpg"},
    timeline:String,
    createdAt:{type:Date,default:Date.now},
    updatedAt: {type:Date,default:Date.now},
    ip:String,
});

userSchema.index({ firstname: 'text',lastname:'text',address:'text',city:'text',
    state:'text',country:'text'});

export default mongoose.model('user',userSchema);