function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>Registration Received!</h3>
            <p>Thank you for registering for the Recruitment Drive.</p>
            <p>An entry badge will be shared on your email upon approval.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Close</button>
        </div>
    `;
    document.body.appendChild(successMessage);
}

async function validateForm(event) {
    event.preventDefault();
    
    // Get form elements
    const form = document.getElementById('registrationForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const qualification = document.getElementById('qualification');

    const experience = document.getElementById('experience');
    const expertise = document.getElementById('expertise');
    const otherExpertise = document.getElementById('otherExpertise');
    const cv = document.getElementById('cv');
    const transactionId = document.getElementById('transactionId');

    // Reset any previous error states
    removeErrorStates();

    // Validate full name (at least 2 words)
    if (fullName.value.trim().split(' ').filter(word => word.length > 0).length < 2) {
        showError(fullName, 'Please enter your full name');
        return false;
    }

    // Validate phone number (simple validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'Please enter a valid 10-digit phone number');
        return false;
    }

    // Validate qualification selection
    if (qualification.value === '') {
        showError(qualification, 'Please select your qualification');
        return false;
    }

    // Validate expertise selection
    if (expertise.value === '') {
        showError(expertise, 'Please select your area of expertise');
        return false;
    }

    // Validate other expertise if selected
    if (expertise.value === 'other' && otherExpertise.value.trim() === '') {
        showError(otherExpertise, 'Please specify your area of expertise');
        return false;
    }

    // Validate CV file
    if (cv.files.length > 0) {
        const file = cv.files[0];
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            showError(cv, 'Please upload a PDF, DOC, or DOCX file');
            return false;
        }

        if (fileSize > 5) {
            showError(cv, 'File size should be less than 5MB');
            return false;
        }
    }

    // Validate M-PESA Transaction ID (must be at least 8 characters)
    const mpesaValue = transactionId.value.trim();
    if (mpesaValue === '' || mpesaValue.length < 8) {
        showError(transactionId, 'Please enter a valid M-PESA Transaction ID (minimum 8 characters)');
        return false;
    }

    // If all validations pass, submit to Google Sheets using JSON (CV excluded)
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const payload = {
        fullName: fullName.value,
        email: email.value,
        phone: phone.value,
        qualification: qualification.value,
        expertise: expertise.value,
        otherExpertise: expertise.value === 'other' ? otherExpertise.value : '',
        experience: experience.value,
        transactionId: transactionId.value,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxa_BAUa1yL6M6rb7lKJbA1aTUu1T6vibrpFvVIbQ_ZYivBld4_cvASxz9vSYF0vsOPtA/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Since we're using no-cors, we won't get a JSON response
        // Instead, we'll assume success if we get here without an error
        showSuccessMessage();
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        showError(form, 'There was an error submitting your registration. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Registration';
    }

    return false;
}

function showError(element, message) {
    element.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerText = message;
    element.parentNode.appendChild(errorDiv);
}

function removeErrorStates() {
    // Remove all error classes
    const elements = document.getElementsByClassName('error');
    while(elements.length > 0) {
        elements[0].classList.remove('error');
    }

    // Remove all error messages
    const errorMessages = document.getElementsByClassName('error-message');
    while(errorMessages.length > 0) {
        errorMessages[0].remove();
    }
}

function toggleOtherExpertise() {
    const expertiseSelect = document.getElementById('expertise');
    const otherExpertiseGroup = document.getElementById('otherExpertiseGroup');
    const otherExpertiseInput = document.getElementById('otherExpertise');
    
    if (expertiseSelect.value === 'other') {
        otherExpertiseGroup.classList.add('show');
        otherExpertiseInput.required = true;
    } else {
        otherExpertiseGroup.classList.remove('show');
        otherExpertiseInput.required = false;
        otherExpertiseInput.value = '';
    }
}
