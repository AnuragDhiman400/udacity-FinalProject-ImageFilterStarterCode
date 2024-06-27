import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  let imageArr = [];
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  app.get("/filteredimage", async (req:express.Request, res:express.Response) => {
    let { image_url } = req.query;
    if (!image_url)
      return res.status(400).send({ message: "The image url is required" });
    
    try {
      let processedImage = await filterImageFromURL(image_url);
      if (!processedImage)
        return res
          .status(422)
          .send({ message: "Image not processed due to some semantic errors." });
  
      imageArr.push(processedImage);
      
      res.status(200).sendFile(processedImage, {}, async function (error:any) {
        if (error) {
          console.log(error);
        } else {
          await deleteLocalFiles(imageArr);
        }
      });
    } catch (error) {
      return res.status(500).send({ message: "Error: Internal Server Error." });
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:any, res:any ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();