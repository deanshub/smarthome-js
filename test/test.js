// let Broadlink = require('broadlinkjs');
const Broadlink = require('../Broadlink');

let fs = require('fs');

var b = new Broadlink();

b.on("deviceReady", (dev) => {
    var timer = setInterval(function(){
        console.log("send check!");
        dev.checkData();
    }, 1000);

    dev.on("temperature", (temp)=>{
        console.log("get temp "+temp);
        // console.log(dev);
        // dev.enterLearning();
    });

    // dev.on("rawData", (data) => {
    //     fs.writeFile("30.deg", data, function(err) {
    //         if(err) {
    //             return console.log(err);
    //         }
    //         console.log("The file was saved!");
    //         clearInterval(timer);
    //     });
    // });
    dev.checkTemperature();

    // fs.readFile('17.deg', (err, data) => {
    //     // console.log(data);
    //     dev.sendData(data)
    // })

    // fs.readFile('off.deg', (err, data) => {
    //     // console.log(data);
    //     dev.sendData(data)
    // })
});

b.discover();

// const Broadlink = require('../Broadlink');
// let b = new Broadlink();
// b.discover();
// b.getIPAddresses()
//
// rawData
//
// b.checkData()
// b.sendData()
// b.enterLearning()
// b.checkTemperature()
// b.cancelLearn()
