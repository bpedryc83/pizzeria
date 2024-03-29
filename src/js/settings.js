export const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
    bookingSummary: '#template-booking-summary',
    orderSummary: '#template-order-summary',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
    pages: '#pages',
    booking: '.booking-wrapper',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
      datePicker: {
        wrapper: '.date-picker',
        input: `input[name="date"]`,
      },
      hourPicker: {
        wrapper: '.hour-picker',
        input: 'input[type="range"]',
        output: '.output',
      },
    },
  },
  buttons: {
    bookTable: '.booking__order-confirmation .btn-secondary',
  },

  booking: {
    bookingWidget: '.booking-widget',
    date: '.time-picker [name="date"]',
    time: '#input-time',
    //time: 'time-picker [name="hour"]',
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    tables: '.floor-plan .table',
    floorPlan: '.floor-plan',
    inputPeopleAmount: '[name="people"]',
    inputDuration: '[name="hours"]',
    inputEMail: '.booking__order-confirmation [name="email"]',
    inputPhone: '.booking__order-confirmation [name="phone"]',
    starters: '.checkbox [name="starter"]',
    upperAlert: '.upper-alert',
    falseValidation: '.false-validation',
    bookingSummary: '#booking-summary',
    bookingDetails: '#booking-details',
    newBookingButton: '#new-booking',
  },
  nav: {
    links: '.main-nav a',
    linksFromTiles: '.tile a',
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
    buttonOrder: '#button-order',
    orderSummary: '#order-summary',
    orderDetails: '#order-details',
    newOrderButton: '#new-order-button',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    table: 'table',
    reserved: 'reserved',
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  }
};

export const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  hours: {
    open: 12,
    close: 24,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  booking: {
    tableIdAttribute: 'data-table',
  },
  db: {
    //url: '//localhost:3131',
    url: '//' + window.location.hostname + (window.location.hostname=='localhost' ? ':3131' : ''),
    products: 'products',
    orders: 'orders',
    booking: 'bookings',
    event: 'events',
    dateStartParamKey: 'date_gte',
    dateEndParamKey: 'date_lte',
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false',
  },
  cart: {
    defaultDeliveryFee: 5,
  },
};

export const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
  bookingSummary: Handlebars.compile(document.querySelector(select.templateOf.bookingSummary).innerHTML),
  orderSummary: Handlebars.compile(document.querySelector(select.templateOf.orderSummary).innerHTML),
};
