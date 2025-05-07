//balance price
const priceMap = {
    "50": "63",
    "100": "125",
    "200": "250",
    "300": "370",
    "400": "490",
    "500": "610",
    "1000": "1210"
};

// Debounce function to delay execution
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update price box based on selected balance
document.getElementById('options').addEventListener('change', function() {
    const selectedValue = this.value;
    const priceBox = document.getElementById('price-box');
    if (selectedValue && priceMap[selectedValue]) {
        priceBox.textContent = `ابعت ${priceMap[selectedValue]}ج علشان تشحن ب ${selectedValue}ج رصيد.`;
        priceBox.style.display = 'block';
    } else {
        priceBox.style.display = 'none';
    }
});

// Input => number for recharge
const numInput = document.getElementById('num');
const numError = document.getElementById('num-error');

const validateNum = debounce(function() {
    const value = numInput.value.trim(); // Remove extra spaces
    numError.textContent = '';
    numError.style.display = 'none';

    if (value.length !== 11) {
        numError.textContent = 'ادخل رقم صحيح';
        numError.style.display = 'block';
    } else if (!value.startsWith('010')) {
        numError.textContent = 'ادخل رقم فودافون';
        numError.style.display = 'block';
    } else {
        numInput.classList.add('valid-input');
    }
}, 300);

numInput.addEventListener('input', validateNum);

// Show relevant fields based on payment method
document.getElementById('payment-method').addEventListener('change', function() {
    const method = this.value;
    const phoneField = document.getElementById('phone-field');
    const instaField = document.getElementById('insta-field');
    const paymentInfoBox = document.getElementById('payment-info-box');
    const paymentInfoText = document.getElementById('payment-info-text');
    const phoneInput = document.getElementById('phone');
    const instaInput = document.getElementById('insta-user');

    if (method === 'cash-wallet') {
        phoneField.style.display = 'block';
        instaField.style.display = 'none';
        paymentInfoBox.style.display = 'block';
        paymentInfoText.textContent = 'ابعت على رقم المحفظة: 01097584431';
        phoneInput.required = true;
        instaInput.required = false;
        instaInput.value = '';
    } else if (method === 'insta-pay') {
        phoneField.style.display = 'none';
        instaField.style.display = 'block';
        paymentInfoBox.style.display = 'block';
        paymentInfoText.textContent = 'ابعت على اليوزر ده: mhmdnsar1';
        phoneInput.required = false;
        instaInput.required = true;
        phoneInput.value = '';
    } else {
        phoneField.style.display = 'none';
        instaField.style.display = 'none';
        paymentInfoBox.style.display = 'none';
        phoneInput.required = false;
        instaInput.required = false;
        phoneInput.value = '';
        instaInput.value = '';
    }
});

// Validate phone input
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');
const validatePhone = debounce(function() {
    let phone = phoneInput.value.replace(/[^0-9]/g, '');
    phoneInput.value = phone;
    if (phone.length !== 11) {
        phoneError.style.display = 'block';
        phoneInput.classList.remove('valid-input');
    } else {
        phoneError.style.display = 'none';
        phoneInput.classList.add('valid-input');
    }
}, 300);

phoneInput.addEventListener('input', validatePhone);

// Validate InstaPay username
const instaInput = document.getElementById('insta-user');
const instaError = document.getElementById('insta-error');
const validateInsta = debounce(function() {
    const instaUser = instaInput.value.trim();
    if (instaUser.length === 0) {
        instaError.style.display = 'block';
        instaInput.classList.remove('valid-input');
    } else {
        instaError.style.display = 'none';
        instaInput.classList.add('valid-input');
    }
}, 300);

instaInput.addEventListener('input', validateInsta);

// Preview uploaded image
document.getElementById('image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
});

// Form submission validation
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const responseDiv = document.getElementById('response');
    const formData = new FormData(this);

    // Client-side validation
    const option = document.getElementById('options').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const phone = document.getElementById('phone').value;
    const instaUser = document.getElementById('insta-user').value;
    const image = document.getElementById('image').files[0];
    const num = document.getElementById('num').value;

    let isValid = true;
    if (num.length !== 11 || !num.startsWith('010')) {
        document.getElementById('num-error').style.display = 'block';
        isValid = false;
    }
    if (!option || !paymentMethod || !image) {
        responseDiv.innerHTML = 'Please fill all required fields.';
        isValid = false;
    }
    if (paymentMethod === 'cash-wallet' && phone.length !== 11) {
        document.getElementById('phone-error').style.display = 'block';
        isValid = false;
    }
    if (paymentMethod === 'insta-pay' && !instaUser.trim()) {
        document.getElementById('insta-error').style.display = 'block';
        isValid = false;
    }

    if (!isValid) {
        responseDiv.innerHTML = 'Please fix the errors above.';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/submit', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (response.ok) {
            responseDiv.innerHTML = `
                Data submitted successfully! <br>
                Balance: ${option} <br>
                Phone Number: ${num} <br>
                Payment Method: ${paymentMethod} <br>
                ${paymentMethod === 'cash-wallet' ? `Cash Number: ${phone}` : `Insta Pay Username: ${instaUser}`} <br>
                Wait and check your Messages!
            `;
            setTimeout(() => window.location.reload(), 3000);
        } else {
            responseDiv.innerHTML = result.error || 'Submission failed.';
        }
    } catch (error) {
        responseDiv.innerHTML = 'Error submitting form.';
    }
});

// Handle balance form submission
document.getElementById('userForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        } else {
            alert('Form submitted successfully!');
        }
    } catch (err) {
        console.error('Submission error:', err);
        alert('An error occurred while submitting the form.');
    }
});

