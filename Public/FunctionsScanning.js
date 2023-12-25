//variable for checking if scann button was pressed
var boolScanned = false;
//variable for quality check state of current product
var boolQualityCheck = false;

//variable for storing information to selected order
var infosFromOrder = null;

//variable to store information about scanned product
var productInfo = null;

//id for order
var shopify_order_id = null;

document.addEventListener("DOMContentLoaded", init);

//function when loading page
async function init() {

    var buttonOK = document.getElementById("buttonOK");
    var buttonNOK = document.getElementById("buttonNOK");
    buttonOK.disabled = true;
    buttonNOK.disabled = true;

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

//function to display information from db after selecting one order from selection
async function createTableOrderInfos(infosFromOrder) {
    
    //get selected item from selection list
    var selectionList = document.getElementById("selectionOpenOrders");
    var selectedOrder = selectionList.value;

    //get shopify-order-id from selected item
    var shopify_order_id_String = selectedOrder.split("|")[0];
    shopify_order_id = parseInt(shopify_order_id_String.match(/\d+/));

    //get information to display
    infosFromOrder = await fetch("http://localhost:8080/scanner/getOpenOrdersFromShopifyOrderID?shopify_order_id=" + shopify_order_id).then((infosFromOrder) => infosFromOrder.json())

    //create table out of data (source: https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery)
    // Get the container element where the table will be inserted
    let orderBox = document.getElementById("orderBox");

    //check if table with orders already exists
    tableCheck = document.getElementById("tableOrders");
    //delete table
    if(tableCheck) {
        orderBox.removeChild(tableCheck);
    }

    // Create the table element
    let table = document.createElement("table");
    table.setAttribute("name", "tableOrders");
    table.setAttribute("id", "tableOrders");
    
    // Get the keys (column names) of the first object in the JSON data
    let cols = Object.keys(infosFromOrder[0]);
    
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
    infosFromOrder.forEach((item) => {
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


//function to start scanning function
async function scanButtonFunction() {
    //get id from qr-code
    var urlCodeID = await fetch("http://localhost:3000/scanning/").then((urlCode) => urlCode.json())

    if (urlCodeID.error) {
        alert(urlCodeID.error);
    } else {
                //get information from db
        productInfo = await fetch("http://localhost:8080/production/getProductByID?productID=" + urlCodeID).then((productInfo) => productInfo.json())

        //show product name on controlBox label
        var controlBoxLabel = document.getElementById("scannedProductLabel");
        controlBoxLabel.innerHTML = productInfo.productName;

        //ask for confirmation from user about scanned product
        var check = confirm("gescanntes Produkt: " + productInfo.productName);
        if (check == true) {
            //set boolen value to true
            boolScanned = true; 
            //activate buttons
            var buttonOK = document.getElementById("buttonOK");
            var buttonNOK = document.getElementById("buttonNOK");
            buttonOK.disabled = false;
            buttonOK.style.backgroundColor = "green";
            
            buttonNOK.disabled = false;
            buttonNOK.style.backgroundColor = "red";

            //disable scanning button
            var buttonScann = document.getElementById("scanButton");
            buttonScann.disabled = true;
            buttonScann.style.backgroundColor = "grey";
        } else {
            //exit function without doing anything
            return 0;
        }
    }
}

//function to get to site for shipping (and optional for personalization)
async function toPersonalizationAndShipping() {
    //window.open("personalizationAndShipping.html?product_ID=" + productInfo.productID);
    window.open("personalizationAndShipping.html?productID=478");
}


//function for OK Button
async function buttonFunctionOK() {

    //update production db with information from object, loaded in advance from order db
    const updatedProduct = await fetch("http://localhost:8080/scanner/assignOrderToProduct?productID=" + productInfo.productID + "&order_id=" + shopify_order_id).then((updatedProduct) => updatedProduct.json());
    
    //check for errors
    if (updatedProduct.error) {
        alert(updatedProduct.error)
    } else {
        //show updated product_ordering table in table
        createTableOrderInfos(infosFromOrder);
    }

}

//???????
async function confirmScan() {
    //insert order data into production db
    await fetch("http://localhost:8080/production/insertOrderData")
}