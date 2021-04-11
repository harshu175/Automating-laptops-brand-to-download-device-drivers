const pup = require('puppeteer');
let cmds = process.argv.slice(2);
let brand = cmds[0];
let pid = cmds[1];
let fs = require('fs');

// Use these serial number in case you don't know yours, to check the working of program
//acer :- 03410538534
// Dell:- 32XR7R1
// MSI :- Msi Don't need a serial number...just put 00 when running msi
// 

let tab;
let browser;
async function main(){

     browser = await pup.launch({
        headless : false,
        defaultViewport : false,
        args : ["--start-maximized"],
        
    });

    let pages = await browser.pages();
    tab= pages[0];
    
    if(brand == "acer" || brand == "Acer" || brand == "ACER"){
        acer(pid);
    }else if(brand == "dell" || brand == "Dell" || brand == "DELL"){
        dell(pid);
    }else if(brand == "MSI" || brand == "msi" || brand == "Msi"){
        msi(pid);
    }else{
        console.log("Invalid Brand Name");
    }
}
main();

async function acer(pid){
    await tab.goto("https://www.acer.com/ac/en/IN/content/home");

    await tab.waitForSelector("a[data-id='262681']", {visible : true});
    await tab.click("a[data-id='262681']");

    await tab.waitForSelector(".megaProduct.supportLink", {visible : true});
    await tab.click(".megaProduct.supportLink");

    await tab.waitForSelector(".zh-searchSN.ui-autocomplete-input", {visible : true});
    await tab.type(".zh-searchSN.ui-autocomplete-input", pid);

    await tab.keyboard.press("Enter");

    await tab.waitForSelector(".zh-driverCnt", {visible : true});
    await tab.click(".zh-driverCnt");

    
    let download_class = await tab.$$(".text-primary-green.no-underline.margin-0.zh-ldtlink.zh-ldt-filename");

    for(let i=1; i<download_class.length; i++){
        let download_link = await tab.evaluate(function(ele){
            return ele.getAttribute("href");
        },download_class[i]);

        await tab.waitForSelector("a[href='"+download_link+"']", {visible : true});
        await tab.click("a[href='"+download_link+"']");
    }

    await tab.keyboard.down("Control");
    await tab.keyboard.press("J");
}

async function dell(pid){
    await tab.goto("https://www.dell.com/en-in");
    
    await tab.goto("https://www.dell.com/support/home/en-in?app=drivers");
    
    await tab.type("#inpEntrySelection", pid);
    await tab.click("#btn-entry-select");

    await tab.waitForSelector(".select.col-md-7.col-xs-12.pl-md-0.pr-0", {visible : true});
    await tab.click(".select.col-md-7.col-xs-12.pl-md-0.pr-0");
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    await tab.waitForSelector(".d-flex", {visible:true});
    let download = await tab.$$(".d-flex a");
    
    let flink= []
    for(let i =5; i<download.length-1; i++){
        let link = await tab.evaluate(function(ele){
            return ele.getAttribute("href")
        },download[i]);
        flink.push(link);
    }
    await tab.waitForSelector(".dl-desk-view", { visible :true});
    let table = await tab.$$(".dl-desk-view");
    let fname = [];
    for(let i=0;i<table.length; i++){
        let name = await tab.evaluate(function(ele){
            return ele.innerText;
        }, table[i]);
        fname.push(name);
    }

    let finalData = {};

    for(let i=0; i<fname.length; i++){
        finalData[fname[i]] = flink[i];
    }
    fs.writeFileSync('Dell_data.json', JSON.stringify(finalData));
    console.log("Not an error Message");
    console.log("Due To incompability and security reasons your laptop brand has banned automation, Name and Link of your device drivers are stored in file name Data.json");
    browser.close();
}

async function msi(pid){
    await tab.goto("https://www.msi.com/support/nb");

    for(let i=0; i<16;i++){
        await tab.keyboard.press('Tab');
    }
    await tab.keyboard.press("Enter");

    await tab.waitForSelector("#MSI_Support", {visible : true});
    await tab.goto("https://www.msi.com/Laptop/support/GT76-Titan-10SX");
    await tab.waitForSelector(".model.form-control", {visible : true});
    await tab.click(".model.form-control");

    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    await tab.waitForSelector("a[data-type='driver']", {visible : true});
    await tab.click("a[data-type='driver']");

    await tab.waitForSelector(".selectric-wrapper.selectric-download-os-select", {visible : true});
    await tab.click(".selectric-wrapper.selectric-download-os-select");

    await tab.waitForSelector(".selectric-scroll", {visible : true});
    await tab.click("li[data-index='1']");
    
    await tab.waitForSelector(".open-title.open-title-has-os-driver", {visible : true});
    await tab.click(".open-title.open-title-has-os-driver");

    let download = await tab.$$(".hvr-bob");
    console.log(download.length);
    let links = [];
    for(let i=0; i<download.length; i++){
        let download_link = await tab.evaluate(function(ele){
            return ele.getAttribute("href");
        }, download[i]);
        links.push(download_link);

    }
    
    let finalData = {};
    for(let i=0; i< links.length;i++){
        finalData[i+1] = links[i];
    }
    fs.writeFileSync('Msi_data.json', JSON.stringify(finalData));
    console.log("Not an error Message");
    console.log("Due To incompability and security reasons your laptop brand has banned automation, Name and Link of your device drivers are stored in file name Data.json");
    browser.close();    
}

