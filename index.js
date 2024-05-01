const express = require("express");
const cors = require("cors")
const fs = require('fs');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");


const userRoutes = require("./routes/user");
const caseRoutes = require("./routes/case");
const partyRoutes = require("./routes/party");
const docRoutes = require("./routes/doc");
const profileRoutes = require("./routes/profile");

const { auth } = require("./middlewares/auth");
const user = require("./models/user");

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp",
	})
)

//EJS view engine setup
app.set('view engine', 'ejs');

app.use('/static', express.static('static'));
app.use('/records', express.static('Records'));
//User Interface Routes
app.get('/pages/home', (req, res) => {
	res.render('index');
});
app.get('/pages/user-dashboard', auth, (req, res) => {
	const token = req.query.token ||
		req.cookies.token ||
		req.body.token ||
		req.header("Authorization").replace("Bearer ", "");
	if(req.user.role=='Admin'){
		res.render('admin',{intoken: token});
	}
	else {
		res.render('user dashboard', { intoken: token });
	}
});

app.get('/pages/party', auth, (req, res) => {
	const token = req.query.token ||
		req.cookies.token ||
		req.body.token ||
		req.header("Authorization").replace("Bearer ", "");
	const caseID = req.query.caseID;
	if (req.user.role == 'Client') {
		res.render('client document', { intoken: token, incaseID: caseID });
	};
	if (req.user.role == 'Lawyer') {
		res.render('lawyer document', { intoken: token, incaseID: caseID });
	};
	if (req.user.role == 'Judge') {
		res.render('judge party', { intoken: token, incaseID: caseID });
	};
})

app.get('/pages/judge-document', auth, (req, res) => {
	const token = req.query.token ||
		req.cookies.token ||
		req.body.token ||
		req.header("Authorization").replace("Bearer ", "");
	const partyID = req.query.partyID;
	res.render('judge document', { intoken: token, inpartyID: partyID });
})

app.get('/pages/doc-view', auth, (req, res) => {
	const fileLink = req.query.fileLink;
	const fileName = req.query.fileName;
	const lastDotIndex = fileName.lastIndexOf('.');
	const ext = lastDotIndex === -1 ? "" : fileName.slice(lastDotIndex + 1);
	if(ext=='pdf' || ext=='docx'){
		//for documents
		res.render('pdf document',{fileLink:fileLink,fileName:fileName});
	}
	if(ext=='png' ||ext=='jpeg' || ext=='jfif' || ext=='jpg'){
		//for images
		res.render('image document',{fileLink:fileLink,fileName:fileName});
	}
	if(ext=='mkv' || ext=='mp4' || ext =='mov' || ext=='avi'){
		//for videos
		res.render('video document',{fileLink:fileLink,fileName:fileName});
	}
});

dotenv.config();
const PORT = process.env.PORT || 3000;
//testing for video streaming

// app.get('/', (req, res) => {
// 	res.sendFile(__dirname + '/view/video testing.html');
//  })

app.get('/notfound', (req, res) => {
    res.status(404).send('Page Not Found');
});


//just paste it in the index.js file
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/case", caseRoutes);
app.use("/api/v1/party", partyRoutes);
app.use("/api/v1/doc", docRoutes);
app.use("/api/v1/user", profileRoutes);

//database connect
database.connect();
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: 'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})