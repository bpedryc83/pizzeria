class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    const returnedIsValid = thisWidget.isValid(newValue);

    if(typeof(returnedIsValid) === 'boolean'&& thisWidget.correctValue != newValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
    }
    else if (typeof(returnedIsValid) === 'object' && thisWidget.correctValue != newValue){
      thisWidget.correctValue = returnedIsValid.newInputValue;
    }
    thisWidget.announce();
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {bubbles: true});
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;