import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import {utils} from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.menu = document.querySelector(select.containerOf.menu);
    thisCart.dom.productList = document.querySelector(select.cart.productList);

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.address = document.querySelector(select.cart.address);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.buttonOrder = document.querySelector(select.cart.buttonOrder);
    thisCart.dom.orderSummary = document.querySelector(select.cart.orderSummary);
  }
  initActions(){
    const thisCart = this;
    let domCartTrashElements;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      if (thisCart.dom.wrapper.classList.contains('active')) {
        domCartTrashElements = thisCart.dom.wrapper.querySelectorAll('.fa-trash-alt');
      }
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    document.addEventListener('click', function (event) {
      const isClickInsideCart = thisCart.dom.wrapper.contains(event.target);
      let trashWasClicked = false;

      if (domCartTrashElements) {
        for (let i = 0 ; i < domCartTrashElements.length ; i++) {
          if (domCartTrashElements[i].contains(event.target)){
            trashWasClicked = true;
            break;
          }
        }
      }

      if (!isClickInsideCart && !trashWasClicked) {
        thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);
      }
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();

    if (thisCart.dom.buttonOrder.classList.contains('not-clickable')) {
      thisCart.dom.buttonOrder.classList.remove('not-clickable');
    }
  }
  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;

    for (let singleProduct of thisCart.products){
      thisCart.totalNumber += singleProduct.amount;
      thisCart.subtotalPrice += singleProduct.price;
    }

    if(thisCart.totalNumber == 0){
      thisCart.deliveryFee = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    for (let element of thisCart.dom.totalPrice){
      element.innerHTML = thisCart.totalPrice;
    }
  }
  remove(object){
    const thisCart = this;

    const removeProductHTML = object.dom.wrapper;
    removeProductHTML.remove();

    const indexOfRemovedObject = thisCart.products.indexOf(object);
    thisCart.products.splice(indexOfRemovedObject, 1);
    thisCart.update();

    if (thisCart.products.length === 0 && !thisCart.dom.buttonOrder.classList.contains('not-clickable')) {
      thisCart.dom.buttonOrder.classList.add('not-clickable');
    }
  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options);
    
    const deliveryObject = {name: 'Delivery', amount: 1, priceSingle: thisCart.deliveryFee, price: thisCart.deliveryFee};
    payload.products.push(deliveryObject);

    for (let i = 0; i < payload.products.length; i++) {
      payload.products[i].index = i + 1;
    }
    
    thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);
    thisCart.dom.menu.classList.remove('active');
    thisCart.dom.orderSummary.classList.add('active');
    const generatedHTML = templates.orderSummary(payload);
    thisCart.dom.orderSummary.innerHTML = generatedHTML;

    thisCart.dom.address.value = '';
    thisCart.dom.phone.value = '';
    thisCart.dom.productList.innerHTML = '';

    thisCart.products = [];
    thisCart.update();

    thisCart.dom.buttonOrder.classList.add('not-clickable');
    thisCart.dom.newOrderButton = document.querySelector(select.cart.newOrderButton);

    thisCart.dom.newOrderButton.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.menu.classList.add('active');
      thisCart.dom.orderSummary.classList.remove('active');
      const productsDivs = document.querySelectorAll('.product');
      for (let i = 0 ; i < productsDivs.length ; i++) {
        productsDivs[i].classList.remove('active');
      }
    });
  }
}

export default Cart;