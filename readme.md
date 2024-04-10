first step is to connect database in this we are using mongodb database.

Database will be in other continent so its bettwe to use async fn and try catch error to connect database succesfully

next step is to connet server and listen through app which is present in index.js

after returning asnyc fn  we get a promise as return ...we are now connecting server..

next step is to install cookie parser and cors to access and change data format cookie parser is used to modify and store users cookis basically creating an app fn to accept files and urls from json format 

next creating a middleware in utility class as asynchandler bcoz to ensure the user is eligible for the request he sent or not middleware checks and ensures this..

<h1>error handling</h1>
<p> in node js error handleing is given as a class so we r making a constructor to show ur custom message on errors in an apierror.js</p>

<h1>api response and error response </h1>
<p>in both response we need to show message which we want to show customly so class and constructor is used to do this to overwrite things in class super keyword is used.. </p>

<h3>summary </h3>

<p>we are successfully conected to mongodb and </p>
<p> we created app and connected to server and if successfully connected we are showing a message but if failed to connect we are showing errors to user 

<h1>models</h1>
<p>video and user models are created inside models folder</p>

<h2> install a plugin named mongoose aggregate v2 </h2>
<p>This unlocks true potential of mongodb..use this plugn inside vide.models.js</p>

<h2>installation of bcrypt and jwt</h2>

<p>bcrypt is used to hash the password and encrypt and decrpt the password</p>
<p> jsonwebtoken creates a bearer token used for security purpose</p>
<p>you cant encrypt a password directly ao u use a hook called <h1>pre</h1></p>
<p>pre hook gets run just before getting saved its encrypts password


<p>after encrypting password we are checking if the password matches with encrypted password or not</p>

<h1>uploading files</h>
<p>in cloudinary were uploading files but before that </p>

<p> we are getting the file from user as a request saving in our own sever temproarily using multer and we pushing it  into cloudinary ...

<h1>process of uploading file in cloudinary
importing cloudinary and multter

file uploading takes time so we're using async and wait ,we cresting a async fn with localfilepath as param and awaiting the response which is uploading part..if successfully uploaded were getting a success message and returning response url to the user but in cases file uploading fails we are removing the file from our server...basically we are using try catch here..


for removing or to unlink the file from our server am using fs(file system)from node..its an inbuild system

# Backend-vidtube
