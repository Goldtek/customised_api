import express, { Application, Response, Request, NextFunction } from "express";
import path from "path";
const app: Application = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req: Request, res: Response ) => {
    // render the index template
    res.render( "index" );
} );

// start the express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
