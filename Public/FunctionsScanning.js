//variable for checking if scann button was pressed
var gl_boolScanned = false;
//variable for quality check state of current product
var gl_boolQualityCheck = false;

//variable for storing information to selected order
var gl_infosFromOrder = null;

//variable to store information about scanned product
var gl_productInfo = null;

//id for order
var gl_shopify_order_id = null;

//variable for new window
var windowPersonalizationAndShipping = null;

//placeholder vars for buttons
var buttonOK = null;
var buttonNOK = null;
var scanButton = null;
var buttonPersonalizatonAndShipping = null;

//Event Listener for init
document.addEventListener("DOMContentLoaded", init);

//function when loading page
async function init() {

    //buttons to enable/ disable
    buttonOK = document.getElementById("buttonOK");
    buttonNOK = document.getElementById("buttonNOK");
    scanButton = document.getElementById("scanButton");
    buttonPersonalizatonAndShipping = document.getElementById("buttonPersonalizatonAndShipping");

    //disable all Buttons before not selecting any order
    //buttonOK.disabled = true;
    //buttonNOK.disabled = true;
    deactivateButton(buttonOK);
    deactivateButton(buttonNOK);
    deactivateButton(buttonPersonalizatonAndShipping);

    //scanButton.disabled = false;
    //buttonPersonalizatonAndShipping.disabled = true;
    activateButton(scanButton, "red");

    //get first 10 production orders from database 
    const displayInformation = {
        "amount": 10
    }

    //get all open shopify order id's from db (= all order Entities, that have amount != processed)
    const index = 0;
    var someOrders = await fetch("http://localhost:8080/scanner/getNextOpenOrders?index=" + index).then((someOrders) => someOrders.json())
    
    console.log(someOrders);

    //show loaded orders in selection Element
    var x = document.getElementById("selectionOpenOrders");
    for (let i=0; i<someOrders.length; i++) {
        var option = document.createElement("option");
        option.text = "AuftragID:" + someOrders[i].shopify_orderID + "  |   " + "Datum: " + someOrders[i].orderDate;
        x.add(option);
    }
}


//function to start scanning function
async function scanButtonFunction() {
    //get id from qr-code
    var urlCodeID = await fetch("http://localhost:3000/scanning/").then((urlCode) => urlCode.json())

    if (urlCodeID.error) {
        alert(urlCodeID.error);
    } else {
        //get information from db for scanned product
        gl_productInfo = await fetch("http://localhost:8080/production/getProductByID?productID=" + urlCodeID).then((gl_productInfo) => gl_productInfo.json())

        //show product name on controlBox label
        var controlBoxLabel = document.getElementById("scannedProductLabel");
        controlBoxLabel.innerHTML = gl_productInfo.productName;

        //ask for confirmation from user about scanned product
        var check = confirm("gescanntes Produkt: " + gl_productInfo.productName);
        if (check == true) {
            //set boolen value to true
            gl_boolScanned = true; 
            
            //if product is never scanned before and can be assigned to order
            if(gl_productInfo.order == null && gl_productInfo.visualInspectionProduction == true) {
                //activate Buttons
                activateButton(buttonOK, "green");
                activateButton(buttonNOK, "red");

                //disable scanning button
                deactivateButton(scanButton);

            //if product has already been scanned before and quality was not good -> product was not assigned to order  
            } else if(gl_productInfo.order == null && gl_productInfo.visualInspectionProduction == false) {
                //chance to reset quality to OK               
                alert("Product was already scanned and rejected. You can change to postive now");

                activateButton(buttonOK, "green");
                deactivateButton(buttonNOK);

            //if product has already been scanned before and assigned to order and quality was good 
            } else if(gl_productInfo.order != null && gl_productInfo.visualInspectionProduction == true) {
                alert("Product was already scanned and assigned to order: " + gl_productInfo.order.shopify_orderID);
                deactivateButton(buttonOK);
                activateButton(buttonNOK, "red");
                activateButton(buttonPersonalizatonAndShipping, "orange");
//                buttonOK.disabled = true;
//                buttonNOK.disabled = false;
            } 
        } else {
            //exit function without doing anything
            return 0;
        }
    }
}


//function to get to site for shipping (and optional for personalization)
async function toPersonalizationAndShipping() {
    //window.open("personalizationAndShipping.html?product_ID=" + gl_productInfo.productID);
    windowPersonalizationAndShipping = window.open("personalizationAndShipping.html?productID=" + gl_productInfo.productID);
    //activate / deactvate buttons
    deactivateButton(buttonOK);
    deactivateButton(buttonNOK);    
    deactivateButton(scanButton); 
    deactivateButton(buttonPersonalizatonAndShipping);     
//    scanButton.disabled = false;
//    buttonOK.disabled = true;
//    buttonNOK.disabled = true;
//    buttonPersonalizatonAndShipping.disabled = true;
}


//function for OK Button
async function visualInspectionScanning(boolInspection) {

    //get selected item from selection list
    gl_shopify_order_id = getShopifyOrderIDfromSelectionBox();

    //if inspection OK
    if (boolInspection) {
        //check if any order is selected to assign product to
        if (gl_shopify_order_id == null) {
            alert("first select order to assign scanned product to");
            return null;
        } 
        else { 
            //ask for confirmation from user about scanned product
            var checkVisualInspection = confirm("gescanntes Produkt: " + gl_productInfo.productName + " verheiraten mit order: " + gl_shopify_order_id + " ?");

            //check whether product is OK or NOK
            if (checkVisualInspection) {

                // json Object with information for OK products
                const assembleInfo = {
                    "productID": gl_productInfo.productID,
                    "orderID": gl_shopify_order_id,
                    "resultVisualInspection": boolInspection
                }
                //if qualtiy is OK then update production db, assign selected order to product
                var updatedProduct = await fetch("http://localhost:8080/scanner/assignOrderToProduct/", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        "Content-Type": "application/json"},
                    body: JSON.stringify(assembleInfo)
                }).then((updatedProduct) => updatedProduct.json());

                //activate shipping button
                activateButton(buttonPersonalizatonAndShipping, "orange");
//                buttonPersonalizatonAndShipping.disabled = false;
//                buttonPersonalizatonAndShipping.style.backgroundColor = "orange";
            } 
            //if selected order is not right
            else {
                alert("select other order")
                return null;
            }
        }
    } 
    //if qualtiy NOK then update db production and db order 
    else {
        // json Object with information about product
        const assembleInfo = {
        "productID": gl_productInfo.productID,
        "orderID": gl_productInfo.order.productOrderID,
        "resultVisualInspection": boolInspection
        }
        var updatedProduct = await fetch("http://localhost:8080/productionFails/visualInspectionScanning/", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json"},
            body: JSON.stringify(assembleInfo)
        }).then((updatedProduct) => updatedProduct.json());

        //deactivate shipping button, because NOK products shall not be shipped
        deactivateButton(buttonPersonalizatonAndShipping);
//        buttonPersonalizatonAndShipping.disabled = true;
//        buttonPersonalizatonAndShipping.style.backgroundColor = "grey";
    }

    //check for errors
    if (updatedProduct && updatedProduct.error) {
        alert(updatedProduct.error)
    } else {
        //show updated product_ordering table in table
        //createTableOrderInfos();
        //location.reload();
    }
}



//---------------------------------------------------------------------------------------------------------------------------------



//function to display information from db after selecting one order from selection
async function createTableOrderInfos() {
    
    //get selected item from selection list
    gl_shopify_order_id = getShopifyOrderIDfromSelectionBox();

    if (gl_shopify_order_id == null) {
        return null;
    }

    //get information to display
    gl_infosFromOrder = await fetch("http://localhost:8080/scanner/getOpenOrdersFromShopifyOrderID?shopify_order_id=" + gl_shopify_order_id).then((gl_infosFromOrder) => gl_infosFromOrder.json())

    //create table out of data (source: https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery)
    // Get the container element where the table will be inserted
    let orderBox = document.getElementById("orderBox");

    //check if table with orders already exists
    tableCheck = document.getElementById("tableOrders");
    //delete table
    if(tableCheck) {
        orderBox.removeChild(tableCheck);
    }

    // Create the table element if orders available
    if (gl_infosFromOrder.length != 0) {
        let table = document.createElement("table");
        table.setAttribute("name", "tableOrders");
        table.setAttribute("id", "tableOrders");
        
        // Get the keys (column names) of the first object in the JSON data
        let cols = Object.keys(gl_infosFromOrder[0]);
        
        // Create the header element
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        
        // Loop through the column names and create header cells
        cols.forEach((item) => {
            let th = document.createElement("th");
            th.setAttribute("name", "tableOrders");
            th.innerText = item; // Set the column name as the text of the header cell
            tr.appendChild(th); // Append the header cell to the header row
        });
    
        thead.appendChild(tr); // Append the header row to the header
        table.append(tr) // Append the header to the table
        
        // Loop through the JSON data and create table rows
        gl_infosFromOrder.forEach((item) => {
            let tr = document.createElement("tr");
        
            // Get the values of the current object in the JSON data
            let vals = Object.values(item);
        
            // Loop through the values and create table cells
            vals.forEach((elem) => {
                let td = document.createElement("td");
                td.setAttribute("name", "tableOrders");
                if (elem.customer_defaultAddress_name) {
                    td.innerText = elem.customer_defaultAddress_name;
                }
                else if(elem.customer_shippingAddress_name) {
                    td.innerText = elem.customer_defaultAddress_name;
                }
                else if(elem.customer_billingAddress_name) {
                    td.innerText = elem.customer_billingAddress_name
                }
                else {
                    td.innerText = elem; // Set the value as the text of the table cell
                }
                tr.appendChild(td); // Append the table cell to the table row
            });
            table.appendChild(tr); // Append the table row to the table
        });
        orderBox.appendChild(table) // Append the table to the container element
    }

    //enable scanning
    activateButton(scanButton, "red");
//    scanButton.disabled = false;
}

function getShopifyOrderIDfromSelectionBox() {
    //get selected item from selection list
    var selectionList = document.getElementById("selectionOpenOrders");
    var selectedOrder = selectionList.value;

    if (selectedOrder) {
        //get shopify-order-id from selected item
        var shopify_order_id_String = selectedOrder.split("|")[0];
        var shopify_order_id = parseInt(shopify_order_id_String.match(/\d+/));
        return shopify_order_id;
    } else {
        return null;
    }
}


function activateButton(button, colour) {
    button.disabled = false; 
    button.style.backgroundColor = colour;
}

function deactivateButton(button) {
    button.disabled = true; 
    button.style.backgroundColor = "grey";
}