import express, { Application, Response, Request, NextFunction } from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import favicon from "serve-favicon"
import logger from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import csrf from "csurf";


const fileUpload = require("express-fileupload"),
sanitizer =  require("express-sanitizer"),
Config = require("./config");

const app: Application = express();
const port = 8080; // default port to listen


app.use(fileUpload());


app.use(cors());
app.use(logger('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(sanitizer())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.disable('x-powered-by');
 app.use(csrf())
 app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.0.0' }))
// app.use(helmet.csp())
app.use(helmet.hsts()); //apply if use ssl
app.use(helmet.noCache())
app.use(helmet.frameguard())
app.use(function(req: Request,res: Response,next: NextFunction){
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
  res.locals.csrftoken = req.csrfToken();
    next();
})
//connecting to database
mongoose.connect(Config.database, { useNewUrlParser: true });

mongoose.connection.on('connected',()=>{
        console.log("successfully connected to the database");
});

mongoose.connection.on('error',(err: any)=>{
       throw err;
});


app.get( "/", ( req: Request, res: Response ) => {
    res.render( "index" );
} );

// start the express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
