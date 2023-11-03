import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.reservedTable = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableReservation();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);
    
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls: ', urls.booking);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for (let item of eventsRepeat){
      if (item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log(thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  tableReservation(){
    const thisBooking = this;

    thisBooking.dom.bookTableButton.addEventListener('click', function(event){
      event.preventDefault();
      let validation = false;

      const phoneValue = thisBooking.dom.inputPhone.value;
      const isValidPhone = /^\d{3,9}$/.test(phoneValue);
      const eMailValue = thisBooking.dom.inputAddress.value;
      const isValidEMail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(eMailValue);
      const tables = thisBooking.dom.tables;
      let isTableReserved = false;
      const falseValidationHTML = thisBooking.dom.falseValidation;
      
      for (let i = 0 ; i < tables.length ; i++) {
        if (tables[i].classList.contains('reserved')) {
          isTableReserved = true;
        }
      }

      if (!isTableReserved) {
        falseValidationHTML.innerHTML = 'Please choose the table';
      }
      else if (!phoneValue || !isValidPhone) {
        falseValidationHTML.innerHTML = 'Please provide correct phone number (only sign "+", minimum 3 and maximum 9 digits)';
      }
      else if (!eMailValue || !isValidEMail) {
        falseValidationHTML.innerHTML = 'Please provide e-mail address correctly';
      }
      else {
        falseValidationHTML.innerHTML = '';
        validation = true;
      }

      if (validation) {
        thisBooking.sendBooking();
        thisBooking.dom.bookingWidget.classList.add('not-visible');
        thisBooking.dom.bookingSummary.classList.remove('not-visible');
        const starters = [];

        for (let starter of thisBooking.dom.starters){
          if (starter.checked == true){
            starters.push(starter.value);
          }
        }

        if (starters.length === 0) {
          starters.push('none');
        }
        
        const bookingData = {
          date: thisBooking.date,
          startHour: utils.numberToHour(thisBooking.hour),
          finishHour: utils.numberToHour(thisBooking.hour + parseInt(thisBooking.dom.inputDuration.value)),
          table: thisBooking.reservedTable,
          peopleAmount: thisBooking.dom.inputPeopleAmount.value,
          starters: starters,
          phone: phoneValue,
          eMail: eMailValue,
        };

        const generatedHTML = templates.bookingSummary(bookingData);
        thisBooking.dom.bookingDetails.innerHTML = generatedHTML;

        thisBooking.dom.newBookingButton.addEventListener('click', function(event){
          event.preventDefault();
          thisBooking.dom.bookingWidget.classList.remove('not-visible');
          thisBooking.dom.bookingSummary.classList.add('not-visible');
          thisBooking.initWidgets();
          thisBooking.dom.inputPhone.value = '';
          thisBooking.dom.inputAddress.value = '';
          for (let i = 0 ; i < starters.length ; i++) {
            starters.splice(i, 1);
          }
          for (let starter of thisBooking.dom.starters){
            if (starter.checked == true){
              starter.checked = false;
            }
          }
          thisBooking.dom.time.value = 12;
          const domRangeSliderFill = document.querySelector('.rangeSlider__fill__horizontal');
          const domRangeSliderHandle = document.querySelector('.rangeSlider__handle__horizontal');

          domRangeSliderFill.style.width = '12px';
          domRangeSliderHandle.style.transform = 'translateX(0px)';
          document.querySelector('.output').innerHTML = '12:00';
        });
      }
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();
      const clickedTableDOM = event.target;
      let currentClickedTable;

      if (clickedTableDOM.classList.contains(classNames.booking.table) && !clickedTableDOM.classList.contains(classNames.booking.tableBooked)){
        currentClickedTable = clickedTableDOM.getAttribute(settings.booking.tableIdAttribute);

        if (thisBooking.reservedTable == null){
          clickedTableDOM.classList.add(classNames.booking.reserved);
          thisBooking.reservedTable = currentClickedTable;
        }
        else if (thisBooking.reservedTable == currentClickedTable){
          clickedTableDOM.classList.remove(classNames.booking.reserved);
          thisBooking.reservedTable = null;          
        }
        else if (thisBooking.reservedTable != currentClickedTable && thisBooking.reservedTable != null){
          clickedTableDOM.classList.add(classNames.booking.reserved);
          const incorrectReservedTableDOM = document.querySelector('[' + settings.booking.tableIdAttribute + '="' + thisBooking.reservedTable + '"]');
          incorrectReservedTableDOM.classList.remove(classNames.booking.reserved);
          thisBooking.reservedTable = currentClickedTable;          
        }
      }
    });
  
  }

  sendBooking(){
    const thisBooking = this;

    console.log('Przed const payLoad oraz wywołaniem makeBooked: ', JSON.parse(JSON.stringify(thisBooking.booked)));

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: parseInt(thisBooking.reservedTable),
      duration: parseInt(thisBooking.dom.inputDuration.value),
      ppl: parseInt(thisBooking.dom.inputPeopleAmount.value),
      starters: [],
      phone: thisBooking.dom.inputPhone.value,
      address: thisBooking.dom.inputAddress.value,
    };

    for (let starter of thisBooking.dom.starters){
      if (starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    
    console.log('Po const payLoad oraz wywołaniu makeBooked: ', thisBooking.booked);

    const justReservedTableDOM = document.querySelector(select.booking.tables + '[' + settings.booking.tableIdAttribute + '="' + thisBooking.reservedTable + '"]');
    justReservedTableDOM.classList.add(classNames.booking.tableBooked);

    const url = settings.db.url + '/' + settings.db.booking;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.reservedTable = null;
    for (let table of thisBooking.dom.tables){
      if (table.classList.contains(classNames.booking.reserved)){
        table.classList.remove(classNames.booking.reserved);
      }
    }
    
    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.bookingWidget = document.querySelector(select.booking.bookingWidget);
    thisBooking.dom.bookingSummary = document.querySelector(select.booking.bookingSummary);
    thisBooking.dom.bookingDetails = document.querySelector(select.booking.bookingDetails);
    thisBooking.dom.newBookingButton = document.querySelector(select.booking.newBookingButton);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.amount.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.amount.hourPicker.wrapper);
    thisBooking.dom.time = document.querySelector(select.booking.time);

    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = document.querySelector(select.booking.floorPlan);
    
    thisBooking.dom.bookTableButton = document.querySelector(select.buttons.bookTable);

    thisBooking.dom.inputPeopleAmount = document.querySelector(select.booking.inputPeopleAmount);
    thisBooking.dom.inputDuration = document.querySelector(select.booking.inputDuration);
    thisBooking.dom.inputPhone = document.querySelector(select.booking.inputPhone);
    thisBooking.dom.inputAddress = document.querySelector(select.booking.inputAddress);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);

    thisBooking.dom.falseValidation = document.querySelector(select.booking.falseValidation);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
}

export default Booking;