import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element, currentValue = false){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.currentValue = currentValue;
    thisWidget.initialValue = true;
    thisWidget.element = element;
    
    thisWidget.getElements(element);
    thisWidget.renderValue();
    thisWidget.initActions();
  }

  initializeWithData(bookedData) {
    const thisWidget = this;
    thisWidget.bookedData = bookedData;
  }

  getElements(){
    const thisWidget = this;
  
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.dom.upperAlert = document.querySelector(select.booking.upperAlert);
  }

  isValid(value){
    const thisWidget = this;


    if (thisWidget.element.classList.contains('people-amount')) {
      return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
    }
    else if (thisWidget.element.classList.contains('hours-amount')) {
      const inputOfTime = document.querySelector(select.booking.time);
      const reservationTime = parseFloat(inputOfTime.value);
      const reservationDate = document.querySelector(select.booking.date).value;
      const durationOfReservation = parseInt(parseInt(document.querySelector(select.booking.inputDuration).value));
      let newInputValue = value;

      thisWidget.dom.upperAlert.innerHTML = '';

      const tables = document.querySelectorAll(select.booking.tables);
      let reservedTable;
      let reservationCollision = false;

      for (let i = 0 ; i < tables.length ; i++) {
        if (tables[i].classList.contains('reserved')) {
          reservedTable = parseInt(tables[i].getAttribute(settings.booking.tableIdAttribute));
        }
      }

      if (reservedTable) {
        for (let hour = reservationTime + 0.5 ; hour <= reservationTime + durationOfReservation ; hour += 0.5) {
          if (!thisWidget.bookedData[reservationDate][hour]) {
            continue;
          }
          if (thisWidget.bookedData[reservationDate][hour].includes(reservedTable)){
            reservationCollision = true;
            thisWidget.dom.upperAlert.classList.add('show-content');
            thisWidget.dom.upperAlert.innerHTML = 'You cannot reserve this table for that many hours, because it overlaps with another reservation.';
            setTimeout(function() {
              thisWidget.dom.upperAlert.innerHTML = '';
              thisWidget.dom.upperAlert.classList.remove('show-content');
            }, 5000);
            break;
          }
        }
      }

      if (!isNaN(value) && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax && !reservationCollision) { 
        if (value + reservationTime <= settings.hours.close - 1) {
          return true;
        }
        else {
          newInputValue = settings.hours.close - Math.ceil(reservationTime);
          return {
            newInputValue: newInputValue,
          };
        }
      }
      else {
        return false;
      }
    }

    else {
      return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
    }
  }

  renderValue(){
    const thisWidget = this;
    if (thisWidget.currentValue && thisWidget.initialValue) {
      thisWidget.dom.input.value = thisWidget.currentValue;
      thisWidget.initialValue = false;
      thisWidget.value = thisWidget.currentValue;
    }
    else {
      thisWidget.dom.input.value = thisWidget.value;
    }
  }

  initActions(){
    const thisWidget = this;
    
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;