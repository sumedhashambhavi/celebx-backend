const express = require('express')
const app = express()
const axios = require('axios')
const multer = require('multer');
var cors = require('cors');

app.use(express.static('public'))
var bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors({
    origin: ['https://celebx-frontend.vercel.app'],
    credentials: true
}));

app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Origin', "https://celebx-frontend.vercel.app");
    res.header('Access-Control-Allow-Headers', true);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.get('/', (req, res) => {
    res.end('Hello World')
})

app.listen(process.env.PORT || 5000)

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

/**
* Create New Item
*
* @return response()
*/
app.post('/upload', upload.single('image'), (req, response) => {
    const data = {
        url: 'https://celebx-backend.herokuapp.com/s/' + req.file.originalname
    };
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': '5b0ae2db974b48efb713e6b3f362417a',
        }
    }

    axios.post('https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories&details=Celebrities&language=en', data, options).then((res) => {
        var names = []
        for (let i = 0; i < res.data.categories.length; i++) {
            if (res.data.categories[i].detail) {
                if (res.data.categories[i].detail.celebrities) {
                    for (let j = 0; j < res.data.categories[i].detail.celebrities.length; j++) {
                        names.push(res.data.categories[i].detail.celebrities[j].name)
                    }
                }
            }
        }

        response.send(JSON.stringify({ "status": 200, "error": null, "celebs": names }))
    }).catch((error) => console.log(error));
});

app.use('/s', express.static('public/images/uploads'))
