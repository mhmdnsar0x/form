// Balance mapping data
const balanceMapping = {
    "50": 63,
    "100": 125,
    "200": 250,
    "300": 370,
    "400": 490,
    "500": 610,
    "1000": 1210
  };
  
  // DOM Elements
  const form = document.getElementById('rechargeForm');
  const balanceSelect = document.getElementById('balance');
  const balanceInfo = document.getElementById('balanceInfo');
  const cashAmountSpan = document.getElementById('cashAmount');
  const rechargeAmountSpan = document.getElementById('rechargeAmount');
  const phoneInput = document.getElementById('phone');
  const phoneError = document.getElementById('phoneError');
  const paymentMethodInput = document.getElementById('paymentMethod');
  const cashMethod = document.getElementById('cashMethod');
  const instaMethod = document.getElementById('instaMethod');
  const cashInstructions = document.getElementById('cashInstructions');
  const instaInstructions = document.getElementById('instaInstructions');
  const cashSenderInput = document.getElementById('cashSender');
  const cashSenderError = document.getElementById('cashSenderError');
  const instaSenderInput = document.getElementById('instaSender');
  const instaSenderError = document.getElementById('instaSenderError');
  const uploadSection = document.getElementById('uploadSection');
  const dropArea = document.getElementById('dropArea');
  const screenshotInput = document.getElementById('screenshot');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');
  const removeImageBtn = document.getElementById('removeImage');
  const submitBtn = document.getElementById('submitBtn');
  
  // Success elements
  const formContainer = document.getElementById('formContainer');
  const successContainer = document.getElementById('successContainer');
  const summaryBalance = document.getElementById('summaryBalance');
  const summaryPhone = document.getElementById('summaryPhone');
  const summaryPaymentMethod = document.getElementById('summaryPaymentMethod');
  const summaryCashAmount = document.getElementById('summaryCashAmount');
  const newRequestBtn = document.getElementById('newRequestBtn');
  
  // Form state
  let formState = {
    balance: "",
    cashAmount: 0,
    phone: "",
    paymentMethod: "",
    senderInfo: "",
    screenshot: null
  };
  
  // Initialize form validation
  function validateForm() {
    const isPhoneValid = isValidPhoneNumber(formState.phone);
    const isBalanceSelected = formState.balance !== "";
    const isPaymentMethodSelected = formState.paymentMethod !== "";
  
    let isSenderInfoValid = false;
    if (formState.paymentMethod === "cash") {
      isSenderInfoValid = isValidCashSender(formState.senderInfo);
    } else if (formState.paymentMethod === "instapay") {
      isSenderInfoValid = isValidInstaSender(formState.senderInfo);
    }
  
    const isScreenshotSelected = formState.screenshot !== null;
  
    submitBtn.disabled = !(
      isPhoneValid && 
      isBalanceSelected && 
      isPaymentMethodSelected && 
      isSenderInfoValid && 
      isScreenshotSelected
    );
  }
  
  // Validation functions
  function isValidPhoneNumber(phone) {
    return /^010\d{8}$/.test(phone);
  }
  
  function isValidCashSender(sender) {
    return /^\d{11}$/.test(sender);
  }
  
  function isValidInstaSender(sender) {
    return /^[a-zA-Z0-9]+$/.test(sender) && sender.length > 0;
  }
  
  function formatCurrency(amount) {
    return `${amount} جنيه`;
  }
  
  // Event listeners
  balanceSelect.addEventListener('change', function() {
    const selectedBalance = this.value;
    if (selectedBalance) {
      formState.balance = selectedBalance;
      formState.cashAmount = balanceMapping[selectedBalance];
  
      // Update the info box
      cashAmountSpan.textContent = formState.cashAmount;
      rechargeAmountSpan.textContent = selectedBalance;
      balanceInfo.classList.remove('hidden');
    } else {
      balanceInfo.classList.add('hidden');
      formState.balance = "";
      formState.cashAmount = 0;
    }
  
    validateForm();
  });
  
  phoneInput.addEventListener('input', function() {
    const phoneValue = this.value.trim();
    formState.phone = phoneValue;
  
    if (phoneValue && !isValidPhoneNumber(phoneValue)) {
      phoneError.classList.remove('hidden');
    } else {
      phoneError.classList.add('hidden');
    }
  
    validateForm();
  });
  
  // Payment method selection
  cashMethod.addEventListener('click', function() {
    selectPaymentMethod('cash');
  });
  
  instaMethod.addEventListener('click', function() {
    selectPaymentMethod('instapay');
  });
  
  function selectPaymentMethod(method) {
    // Clear previous selection
    cashMethod.classList.remove('selected');
    instaMethod.classList.remove('selected');
    cashInstructions.classList.add('hidden');
    instaInstructions.classList.add('hidden');
  
    // Clear sender info
    formState.senderInfo = "";
    cashSenderInput.value = "";
    instaSenderInput.value = "";
    cashSenderError.classList.add('hidden');
    instaSenderError.classList.add('hidden');
  
    // Set new selection
    formState.paymentMethod = method;
    paymentMethodInput.value = method;
  
    if (method === 'cash') {
      cashMethod.classList.add('selected');
      cashInstructions.classList.remove('hidden');
    } else {
      instaMethod.classList.add('selected');
      instaInstructions.classList.remove('hidden');
    }
  
    // Show upload section
    uploadSection.classList.remove('hidden');
  
    validateForm();
  }
  
  // Sender info validation
  cashSenderInput.addEventListener('input', function() {
    const value = this.value.trim();
    formState.senderInfo = value;
  
    if (value && !isValidCashSender(value)) {
      cashSenderError.classList.remove('hidden');
    } else {
      cashSenderError.classList.add('hidden');
    }
  
    validateForm();
  });
  
  instaSenderInput.addEventListener('input', function() {
    const value = this.value.trim();
    formState.senderInfo = value;
  
    if (value && !isValidInstaSender(value)) {
      instaSenderError.classList.remove('hidden');
    } else {
      instaSenderError.classList.add('hidden');
    }
  
    validateForm();
  });
  
  // File handling
  dropArea.addEventListener('click', function() {
    screenshotInput.click();
  });
  
  screenshotInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  });
  
  // Drag and drop functionality
  dropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  
  dropArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
  });
  
  dropArea.addEventListener('drop', function(e) {
    this.classList.remove('drag-over');
  
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
  
  function handleFileSelect(file) {
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('برجاء اختيار صورة فقط');
      return;
    }
  
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }
  
    // Store the file in form state
    formState.screenshot = file;
  
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImage.src = e.target.result;
      previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  
    validateForm();
  }
  
  // Remove image
  removeImageBtn.addEventListener('click', function() {
    previewContainer.classList.add('hidden');
    previewImage.src = '';
    screenshotInput.value = '';
    formState.screenshot = null;
  
    validateForm();
  });
  
  // Form submission
  form.addEventListener('submit', function(e) {
  
    // Final validation
    if (!submitBtn.disabled) {
      // Create order summary
      const orderSummary = {
        balance: formState.balance,
        cashAmount: formState.cashAmount,
        phone: formState.phone,
        paymentMethod: formState.paymentMethod,
        senderInfo: formState.senderInfo
      };
  
      // Display in success message
      summaryBalance.textContent = formatCurrency(parseInt(orderSummary.balance));
      summaryPhone.textContent = orderSummary.phone;
      summaryPaymentMethod.textContent = orderSummary.paymentMethod === 'cash' ? 'محفظة كاش' : 'انستا باي';
      summaryCashAmount.textContent = formatCurrency(orderSummary.cashAmount);
  
      // Show success message and hide form
      formContainer.classList.add('hidden');
      successContainer.classList.remove('hidden');
    }
  });
  
  // New request button
  newRequestBtn.addEventListener('click', function() {
    // Reset form
  
    // Reset form state
    formState = {
      balance: "",
      cashAmount: 0,
      phone: "",
      paymentMethod: "",
      senderInfo: "",
      screenshot: null
    };
  
    // Reset UI
    balanceInfo.classList.add('hidden');
    phoneError.classList.add('hidden');
    cashMethod.classList.remove('selected');
    instaMethod.classList.remove('selected');
    cashInstructions.classList.add('hidden');
    instaInstructions.classList.add('hidden');
    uploadSection.classList.add('hidden');
    previewContainer.classList.add('hidden');
  
    // Show form and hide success
    formContainer.classList.remove('hidden');
    successContainer.classList.add('hidden');
  
    // Disable submit button
    submitBtn.disabled = true;
  });