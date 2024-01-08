//global variable to store product Object
var glObjProduct = null;

//global variable for shopify_order_id
var gl_shopify_orderID = null;

//placeholder vars for buttons
var shippingButton= null;

document.addEventListener("DOMContentLoaded", init);


//function when loading page
async function init() {

    //get parameters from url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    //extract infos from URL
    var productID = urlParams.get('productID');
    
    //get product information from backend
    const product = await fetch("http://localhost:8080/production/getProductByID?productID=" + productID, {
        credentials: "include",
        mode: "cors",
    }).then((product) => product.json());

    //assign to global Variable
    glObjProduct = product;

    //show information to product
    var productInformation = document.getElementById("productInformation");
    productInformation.innerHTML = "product name: " + glObjProduct.productName + " | " + "shopify order ID: " + glObjProduct.order.shopify_orderID

    //if product shall be personalized
    if (glObjProduct.boolPersonalization == true) {

        //disable shipping button
        shippingButton = document.getElementById("buttonShipping");
        shippingButton.disabled = true;
        shippingButton.style.backgroundColor = "grey";

        //create Buttons
        var buttonPersonalizationOK = document.createElement("button");
        buttonPersonalizationOK.setAttribute("id", "buttonPersonalizationOK");
        buttonPersonalizationOK.setAttribute("onclick", "setPersonalizationQualtiy(true)");
        buttonPersonalizationOK.textContent = "OK";

        var buttonPersonalizationNOK = document.createElement("button");
        buttonPersonalizationNOK.setAttribute("id", "buttonPersonalizationNOK");
        buttonPersonalizationNOK.setAttribute("onclick", "setPersonalizationQualtiy(false)");
        buttonPersonalizationNOK.textContent = "NOK";

        //create header
        var headerH2Personalization = document.createElement("h2");
        headerH2Personalization.innerText = "Personalization Quality";

        //hang in DOM
        var divPersonalization = document.getElementById("divPersonalization");
        divPersonalization.appendChild(headerH2Personalization)
        divPersonalization.appendChild(buttonPersonalizationOK);
        divPersonalization.appendChild(buttonPersonalizationNOK);
    }
}


//function to get address information for shipping
async function getShippingInformation() {
    //get shipping Address information from product Object
    var productCustomer = glObjProduct.order.customer;

    var AddressPostCode = document.getElementById("shippingAddressPostCode");
    AddressPostCode.innerText = productCustomer.customer_shippingAddress_postcode;
    
    var AddressStreet = document.getElementById("shippingAddressStreet");
    AddressStreet.innerText = productCustomer.customer_shippingAddress_street;
    
    var AddressStreetNr = document.getElementById("shippingAddressStreetNr");
    AddressStreetNr.innerText = productCustomer.customer_shippingAddress_streetNr;
    
    var AddressName = document.getElementById("shippingAddressName");
    AddressName.innerText = productCustomer.customer_shippingAddress_name;

    var AddressCompany = document.getElementById("shippingAddressCompany");
    AddressCompany.innerText = productCustomer.customer_shippingAddress_company;

    const shippingInformation = {
        "productID": glObjProduct.productID,
        "shippingStatus": true
    }

    //mark product as shipped
    glObjProduct = await fetch("http://localhost:8080/scanner/shippingStatus", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"},
        body: JSON.stringify(shippingInformation),
        credentials: "include",
        mode: "cors",
    }).then((glObjProduct) => glObjProduct.json());
}


//function to set inspection result for personalization
async function setPersonalizationQualtiy(boolQualityPersonalizazion) {

    //create JSON Object to send with POST request
    const visualInspection = {
        "productID": glObjProduct.productID,
        "resultVisualInspection": boolQualityPersonalizazion,
    }

    //set attribute for end quality check in db_production
    const product = await fetch("http://localhost:8080/productionFails/visualInspectionPersonalization", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"},
        body: JSON.stringify(visualInspection),
        credentials: "include",
        mode: "cors",
    }).then((product) => product.json());

    //assign updated product to global Object
    glObjProduct = product;

    //activate shipping button
    if (boolQualityPersonalizazion == true) {
        var shippingButton = document.getElementById("buttonShipping");
        shippingButton.disabled = false;
        shippingButton.style.backgroundColor = "black";
    }
}