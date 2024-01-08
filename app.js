const express = require('express');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const http = require('node:http');

//authorization check
var authorizationCheck = false;

//use express framework for front end
const app = express()
//use port 3000
app.listen(3000);

//use router middleware
var router = express.Router();


//routing
app.use('/', router);
app.use('/', express.static(path.join(__dirname, 'Public', )));
router.use('/', express.static(path.join(__dirname, 'Public', )));
router.use('/scanning/', express.static(path.join(__dirname, 'Public', )));

//set authorization 
router.get('/authorize/', async function(req, res) {
    authorizationCheck = true;
    res.send(true);
})


//routing for home directory
router.get('/', async function(req, res) {
    res.sendFile(path.join(__dirname, "Public", "Scanning.html"));
})

router.get('/scanning/', async function(req, res) {
    console.log("current directory: " + __dirname);

    const pythonProcess = spawnSync('python', ["./Python/qrCodeScanner.py"]);

    const dataString = String(pythonProcess.stdout);

    console.log(String(pythonProcess.stdout))
    if(dataString && dataString.split('?')) {
        var parameters = dataString.split('?')[1];

        if (parameters && parameters.split('=')) {
            var productIDString = parameters.split('=')[1];
            var productID = productIDString.match(/(\d+)/)[0];
            res.send(productID);
        } else {
            const errorPythonAppClosed = new Error("Camera closed without qr-Codes scanning");
            res.status(404).json({error: errorPythonAppClosed.message});
        }
    }

    //show url code on console 
/*     var qrCode = pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout:` + data);
        dataString = String(data);

        if(dataString.split('?')) {
            var parameter = dataString.split('?')[1];

            if (parameter.split('=')) {
                var productIDString = parameter.split('=')[1];
                var productID = productIDString.match(/(\d+)/)[0];
                res.send(productID);
            }
        }        
    }); */
})
