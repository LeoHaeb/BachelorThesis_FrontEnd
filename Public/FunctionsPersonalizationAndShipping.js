//global variable to store product Object
var product = null;

document.addEventListener("DOMContentLoaded", init);

//function when loading page
async function init() {

    //get parameters from url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    //get product information from backend
    var productID = urlParams.get('productID');
    //alert("prductID = " + productID);
    product = await fetch("http://localhost:8080/production/getProductByID?productID=" + productID).then((product) => product.json());

    if (product.boolPersonalization) {
        //create Buttons
        var buttonPersonalizationOK = document.createElement("button");
        buttonPersonalizationOK.setAttribute("id", "buttonPersonalizationOK");
        buttonPersonalizationOK.setAttribute("onclick", "setPersonalizationQualtiy(true)");

        var buttonPersonalizationNOK = document.createElement("button");
        buttonPersonalizationNOK.setAttribute("id", "buttonPersonalizationNOK");
        buttonPersonalizationNOK.setAttribute("onclick", "setPersonalizationQualtiy(false)");

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

async function getShippingInformation() {
    //get shipping Address information from product Object
    var productCustomer = product.order.customer;

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
}

async function setPersonalizationQualtiy(boolQualityPersonalizazion) {
    alert(boolQualityPersonalizazion);

    //create JSON Object to send with POST request
    const visualInspection = {
        "productID": product.productID,
        "resultVisualInspection": boolQualityPersonalizazion,
    }

//    product = await fetch("http://localhost:8080/productionFails/visualInspectionPersonalization");

    //set attribute for end quality check in db_production
    product = await fetch("http://localhost:8080/productionFails/visualInspectionPersonalization", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"},
        body: JSON.stringify(visualInspection)
    })
}