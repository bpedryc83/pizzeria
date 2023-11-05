import BaseWidget from '../components/BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';
import RangeSlider from '../../vendor/range-slider.js';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.amount.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    const upperAlertHTML = document.querySelector(select.booking.upperAlert);
    // eslint-disable-next-line no-undef
    RangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function(){
      const clickedIncrease = (parseFloat(thisWidget.value) < parseFloat(thisWidget.dom.input.value) ? true : false);
      const inputDuration = document.querySelector(select.booking.inputDuration);
      const duration = parseInt(inputDuration.value);
      thisWidget.value = thisWidget.dom.input.value;
       
      if (clickedIncrease && utils.hourToNumber(thisWidget.value) + duration > settings.hours.close - 1) {
        inputDuration.value = settings.hours.close - Math.ceil(parseFloat(utils.hourToNumber(thisWidget.value)));
        upperAlertHTML.innerHTML = 'The end time of the reservation cannot be later than the restaurant&apos;s closing time.&#10; The reservation duration has been updated.';
      }
      else {
        upperAlertHTML.innerHTML = '';
      }
    });
  }

  parseValue(value){
    return utils.numberToHour(value);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;
