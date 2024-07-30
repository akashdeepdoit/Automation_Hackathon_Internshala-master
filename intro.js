const puppeteer = require("puppeteer")
console.log("Before");
const browserOpenpromise = puppeteer.launch({headless:false});

browserOpenpromise.then(function(browser){

    browser.pages();

    console.log("Browser Opened");

})
console.log("After");