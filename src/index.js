import express from "express";
import dotenv from "dotenv";
import path from 'path';
import session from 'express-session';
import flash from 'express-flash';

import routes from "./routes";

const app = express();

//set up dotenv
dotenv.config();
const PORT = process.env.PORT || 3000;

//set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//set up static files
app.use(express.static(path.join(__dirname, 'public')));

//set up session
app.use(
	session({
		secret: 'abcxyzthisissecretkey',
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
			// secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
		},
	})
);
app.use(async function (req, res, next) {
	// if there's a flash message in the session request, make it available in the response, then delete it
	res.locals.sessionFlash = req.session.sessionFlash;
	delete req.session.sessionFlash;

	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.user = req.session.user;
	res.locals.userId = req.session.userId;
	// session view posts
	res.locals.sessionViewPosts = req.session.sessionViewPosts;
	next();
});


//set up flash
app.use(flash());

//set up body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set up routes
routes(app);

// run the server
app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}`);
});

