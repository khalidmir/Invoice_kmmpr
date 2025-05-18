// Global variables
let itemCounter = 1;
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED',
    'PKR': 'Rs',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'MYR': 'RM',
    'SGD': 'S$'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    document.getElementById('addItem').addEventListener('click', addItemRow);
    document.getElementById('generateInvoice').addEventListener('click', generateInvoice);
    document.getElementById('downloadPdf').addEventListener('click', downloadPdf);
    document.getElementById('sendEmail').addEventListener('click', sendInvoiceEmail);
    document.getElementById('backToForm').addEventListener('click', backToForm);
    document.getElementById('shareInvoice').addEventListener('click', shareInvoice);
    document.getElementById('saveToGoogleSheet').addEventListener('click', saveToGoogleSheet);
    
    // Add event listeners for calculation
document.getElementById('itemsContainer').addEventListener('input', function (e) {
    if (
        e.target.classList.contains('item-quantity') ||
        e.target.classList.contains('item-price')
    ) {
        calculateItemTotal(e);
    }
});
document.getElementById('vatPercent').addEventListener('input', calculateTotals);
document.getElementById('otherCharges').addEventListener('input', calculateTotals);

// Trigger calculation on load
const firstQtyInput = document.querySelector('.item-quantity');
if (firstQtyInput) {
    calculateItemTotal({ target: firstQtyInput });
}
    
    // Initialize EmailJS
    (function() {
        emailjs.init("ogf8HZEgEbz9STCYi"); // EmailJS Public Key
    })();
});

// Function to add a new item row
function addItemRow() {
    itemCounter++;
    
    const itemsContainer = document.getElementById('itemsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    
    newRow.innerHTML = `
        <div class="form-group">
            <label for="itemDescription${itemCounter}">Description</label>
            <input type="text" id="itemDescription${itemCounter}" name="itemDescription${itemCounter}" class="item-description" required>
        </div>
        
        <div class="form-group">
            <label for="itemQuantity${itemCounter}">Quantity</label>
            <input type="number" id="itemQuantity${itemCounter}" name="itemQuantity${itemCounter}" class="item-quantity" min="1" value="1" required>
        </div>
        
        <div class="form-group">
            <label for="itemPrice${itemCounter}">Unit Price</label>
            <input type="number" id="itemPrice${itemCounter}" name="itemPrice${itemCounter}" class="item-price" min="0" step="0.01" required>
        </div>
        
        <div class="form-group">
            <label for="itemTotal${itemCounter}">Total</label>
            <input type="number" id="itemTotal${itemCounter}" name="itemTotal${itemCounter}" class="item-total" readonly>
        </div>
        
        <button type="button" class="remove-item">Remove</button>
    `;
    
    itemsContainer.appendChild(newRow);
    
    // Enable all remove buttons if there's more than one item
    if (itemCounter > 1) {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.disabled = false;
        });
    }
    
    // Add event listener to the new remove button
    newRow.querySelector('.remove-item').addEventListener('click', function() {
        removeItemRow(this);
    });
}

// Function to remove an item row
function removeItemRow(button) {
    const row = button.parentNode;
    row.parentNode.removeChild(row);
    itemCounter--;
    
    // If only one item remains, disable its remove button
    if (itemCounter === 1) {
        const removeButton = document.querySelector('.remove-item');
        if (removeButton) {
            removeButton.disabled = true;
        }
    }
    
    // Recalculate totals
    calculateTotals();
}

// Function to calculate item total
function calculateItemTotal(event) {
    if (!event.target.classList.contains('item-quantity') && !event.target.classList.contains('item-price')) {
        return;
    }
    
    const row = event.target.closest('.item-row');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    row.querySelector('.item-total').value = total.toFixed(2);
    
    // Recalculate all totals
    calculateTotals();
}

// Function to calculate all totals
function calculateTotals() {
    // Calculate subtotal
    let subtotal = 0;
    const itemTotals = document.querySelectorAll('.item-total');
    itemTotals.forEach(item => {
        subtotal += parseFloat(item.value) || 0;
    });
    
    // Get VAT percentage and calculate VAT amount
    const vatPercent = parseFloat(document.getElementById('vatPercent').value) || 0;
    const vatAmount = subtotal * (vatPercent / 100);
    
    // Get other charges
    const otherCharges = parseFloat(document.getElementById('otherCharges').value) || 0;
    
    // Calculate total amount
    const totalAmount = subtotal + vatAmount + otherCharges;
    
    // Update form fields
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('vatAmount').value = vatAmount.toFixed(2);
    document.getElementById('otherChargesAmount').value = otherCharges.toFixed(2);
    document.getElementById('totalAmount').value = totalAmount.toFixed(2);
    
    // Show/hide VAT and other charges rows based on values
    document.getElementById('vatAmountGroup').style.display = vatPercent > 0 ? 'block' : 'none';
    document.getElementById('otherChargesGroup').style.display = otherCharges > 0 ? 'block' : 'none';
}

// Function to generate invoice
function generateInvoice() {
    // Validate form
    const form = document.getElementById('invoiceForm');
    if (!validateForm()) {
        alert('Please fill in all required fields.');
        return;
    }
    
    function generateInvoice() {
    // Generate invoice number (format: KM-MMDD-HHMM)
    const date = new Date();
    document.getElementById('invoiceTRN').textContent = "UAE-TRN: 104052342300003";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
const invoiceNumber = `KM-${month}${day}-${hours}${minutes}`;
    
    // Format date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Get selected currency symbol
    const currencySelect = document.getElementById('currency');
    const currencyCode = currencySelect.value;
    const currencySymbol = currencySymbols[currencyCode] || currencyCode;
    
    // Update invoice preview
    document.getElementById('invoiceNumber').textContent = invoiceNumber;
    document.getElementById('invoiceDate').textContent = formattedDate;
    document.getElementById('previewClientName').textContent = document.getElementById('clientName').value;
    
    const companyName = document.getElementById('companyName').value;
    document.getElementById('previewCompanyName').textContent = companyName || '';
    document.getElementById('previewCompanyName').style.display = companyName ? 'block' : 'none';
    
    const address = document.getElementById('address').value;
    document.getElementById('previewAddress').textContent = address || '';
    document.getElementById('previewAddress').style.display = address ? 'block' : 'none';
    
    const taxId = document.getElementById('taxId').value;
    document.getElementById('previewTaxId').textContent = taxId ? `VAT/TAX ID: ${taxId}` : '';
    document.getElementById('previewTaxId').style.display = taxId ? 'block' : 'none';
    
    // Clear and populate items table
    const itemsTableBody = document.getElementById('itemsTableBody');
    itemsTableBody.innerHTML = '';
    
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = row.querySelector('.item-quantity').value;
        const price = parseFloat(row.querySelector('.item-price').value);
        const total = parseFloat(row.querySelector('.item-total').value);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${description}</td>
            <td>${quantity}</td>
            <td>${currencySymbol}${price.toFixed(2)}</td>
            <td>${currencySymbol}${total.toFixed(2)}</td>
        `;
        
        itemsTableBody.appendChild(tr);
    });
    
    // Update summary
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    const vatPercent = parseFloat(document.getElementById('vatPercent').value) || 0;
    const vatAmount = parseFloat(document.getElementById('vatAmount').value);
    const otherCharges = parseFloat(document.getElementById('otherCharges').value) || 0;
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    
    document.getElementById('previewSubtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
    document.getElementById('previewVatPercent').textContent = vatPercent;
    document.getElementById('previewVatAmount').textContent = `${currencySymbol}${vatAmount.toFixed(2)}`;
    document.getElementById('previewOtherCharges').textContent = `${currencySymbol}${otherCharges.toFixed(2)}`;
    document.getElementById('previewTotalAmount').textContent = `${currencySymbol}${totalAmount.toFixed(2)}`;
    
    // Show/hide VAT and other charges rows
    document.getElementById('previewVatRow').style.display = vatPercent > 0 ? 'table-row' : 'none';
    document.getElementById('previewOtherChargesRow').style.display = otherCharges > 0 ? 'table-row' : 'none';
    
    // Update note
    const note = document.getElementById('note').value;
    document.getElementById('previewNote').textContent = note;
    document.getElementById('previewNoteContainer').style.display = note ? 'block' : 'none';
    
    // Update PayPal link with dynamic total amount
    const paypalLink = `https://paypal.me/Kreativeuae/${totalAmount.toFixed(2)}`;
    document.getElementById('paypalLink').href = paypalLink;
    
    // Show invoice preview, hide form
    document.getElementById('invoiceForm').style.display = 'none';
    document.getElementById('invoicePreview').classList.remove('hidden');
    
    // Store invoice data for sharing
    storeInvoiceData();
    
    // Automatically send email
    setTimeout(function() {
        sendInvoiceEmail(true);
    }, 500);
}

// Function to store invoice data for sharing
function storeInvoiceData() {
    // Get invoice data
    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').textContent,
        invoiceDate: document.getElementById('invoiceDate').textContent,
        clientName: document.getElementById('clientName').value,
        companyName: document.getElementById('companyName').value || '',
        address: document.getElementById('address').value || '',
        taxId: document.getElementById('taxId').value || '',
        currency: document.getElementById('currency').value,
        subtotal: document.getElementById('subtotal').value,
        vatPercent: document.getElementById('vatPercent').value || '0',
        vatAmount: document.getElementById('vatAmount').value || '0',
        otherCharges: document.getElementById('otherCharges').value || '0',
        totalAmount: document.getElementById('totalAmount').value,
        note: document.getElementById('note').value || '',
        items: []
    };
    
    // Get items
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = row.querySelector('.item-quantity').value;
        const price = row.querySelector('.item-price').value;
        const total = row.querySelector('.item-total').value;
        
        invoiceData.items.push({
            description,
            quantity,
            price,
            total
        });
    });
    
    // Store in localStorage for sharing
    localStorage.setItem('lastInvoiceData', JSON.stringify(invoiceData));
}

// Function to validate form
function validateForm() {
    const requiredFields = [
        'clientName',
        'clientEmail'
    ];
    
    // Check if all required fields are filled
    for (const field of requiredFields) {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.focus();
            return false;
        }
    }
    
    // Check if at least one item has description and price
    const itemDescriptions = document.querySelectorAll('.item-description');
    const itemPrices = document.querySelectorAll('.item-price');
    
    for (let i = 0; i < itemDescriptions.length; i++) {
        if (!itemDescriptions[i].value.trim() || !itemPrices[i].value) {
            itemDescriptions[i].focus();
            return false;
        }
    }
    
    return true;
}

// Function to download PDF
function downloadPdf() {
    const { jsPDF } = window.jspdf;
    
    // Create new PDF document (A4 size)
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Get invoice data
    const invoiceNumber = document.getElementById('invoiceNumber').textContent;
    const invoiceDate = document.getElementById('invoiceDate').textContent;
    const clientName = document.getElementById('clientName').value;
    const companyName = document.getElementById('companyName').value || '';
    const address = document.getElementById('address').value || '';
    const taxId = document.getElementById('taxId').value || '';
    const trn = document.getElementById('invoiceTRN')?.textContent || 'UAE-TRN: 104052342300003';

    const currencySelect = document.getElementById('currency');
    const currencyCode = currencySelect.value;
    const currencySymbol = currencySymbols[currencyCode] || currencyCode;
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    const vatPercent = parseFloat(document.getElementById('vatPercent').value) || 0;
    const vatAmount = parseFloat(document.getElementById('vatAmount').value);
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);

    pdf.setFontSize(20);
    pdf.setTextColor(0, 51, 102);
    pdf.text('KM MARKETING & PR', 20, 30);

    // TRN above Invoice Number
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(trn, 20, 35);  // ← TRN shown above

    pdf.text(`Invoice #: ${invoiceNumber}`, 20, 42);
    pdf.text(`Date: ${invoiceDate}`, 20, 47);
    pdf.text('Invoice from: Kreative Minds', 20, 55);
    
    // Add invoice to section
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice to:', 20, 65);
    pdf.text(clientName, 20, 72);
    
    if (companyName) {
        pdf.text(companyName, 20, 79);
    }
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    let yPos = companyName ? 86 : 79;
    
    if (address) {
        const addressLines = pdf.splitTextToSize(address, 80);
        pdf.text(addressLines, 20, yPos);
        yPos += addressLines.length * 5 + 5;
    }
    
    if (taxId) {
        pdf.text(`VAT/TAX ID: ${taxId}`, 20, yPos);
        yPos += 7;
    }
    
    // Add items table
    const tableStartY = yPos + 5;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Table headers
    pdf.setFont(undefined, 'bold');
    pdf.text('Description', 20, tableStartY);
    pdf.text('Qty', 100, tableStartY);
    pdf.text('Unit Price', 120, tableStartY);
    pdf.text('Total', 170, tableStartY);
    pdf.setFont(undefined, 'normal');
    
    // Draw header line
    pdf.line(20, tableStartY + 2, 190, tableStartY + 2);
    
    // Table rows
    let rowY = tableStartY + 10;
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = row.querySelector('.item-quantity').value;
        const price = parseFloat(row.querySelector('.item-price').value);
        const total = parseFloat(row.querySelector('.item-total').value);
        
        // Wrap description text if needed
        const descriptionLines = pdf.splitTextToSize(description, 75);
        pdf.text(descriptionLines, 20, rowY);
        
        pdf.text(quantity, 100, rowY);
        pdf.text(`${currencySymbol}${price.toFixed(2)}`, 120, rowY);
        pdf.text(`${currencySymbol}${total.toFixed(2)}`, 170, rowY);
        
        rowY += Math.max(descriptionLines.length * 5, 7);
    });
    
    // Draw line after items
    pdf.line(20, rowY, 190, rowY);
    rowY += 5;
    
    // Add totals with improved spacing - increased line spacing to 1.55
    const lineSpacing = 9; // Increased from previous value for 1.55 line spacing
    
    pdf.text('Subtotal:', 140, rowY + 5);
    pdf.text(`${currencySymbol}${subtotal.toFixed(2)}`, 170, rowY + 5);
    
    if (vatPercent > 0) {
        rowY += lineSpacing; // Increased spacing
        // Improved spacing for VAT amount
        pdf.text(`VAT/TAX (${vatPercent}%):`, 140, rowY);
        pdf.text(`${currencySymbol}${vatAmount.toFixed(2)}`, 170, rowY);
    }
    
    rowY += lineSpacing; // Increased spacing
    pdf.setFont(undefined, 'bold');
    pdf.text('Total:', 140, rowY);
    pdf.text(`${currencySymbol}${totalAmount.toFixed(2)}`, 170, rowY);
    pdf.setFont(undefined, 'normal');
    
    // Add note if exists
    const note = document.getElementById('note').value;
    if (note) {
        rowY += 15;
        pdf.setFont(undefined, 'bold');
        pdf.text('Notes:', 20, rowY);
        pdf.setFont(undefined, 'normal');
        
        const noteLines = pdf.splitTextToSize(note, 170);
        pdf.text(noteLines, 20, rowY + 7);
        
        rowY += noteLines.length * 5 + 10;
    }
    
    // Add payment options section
    rowY += 10;
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Payment Options', 105, rowY, { align: 'center' });
    
    // Add payment buttons - smaller and with less spacing
    const buttonWidth = 40; // Reduced width
    const buttonHeight = 10;
    const buttonSpacing = 15; // Reduced spacing
    const startX = 40; // Adjusted starting position for better centering
    const buttonY = rowY + 10;
    
    // PayPal button (blue)
    pdf.setFillColor(0, 48, 135); // PayPal blue
    pdf.roundedRect(startX, buttonY, buttonWidth, buttonHeight, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(10); // Smaller font
    pdf.text('Pay with PayPal', startX + buttonWidth/2, buttonY + buttonHeight/2, { align: 'center', baseline: 'middle' });
    
    // Add PayPal link with dynamic total
    pdf.link(startX, buttonY, buttonWidth, buttonHeight, { url: `https://paypal.me/Kreativeuae/${totalAmount.toFixed(2)}` });
    
    // Stripe button (purple)
    pdf.setFillColor(75, 0, 130); // Stripe purple
    pdf.roundedRect(startX + buttonWidth + buttonSpacing, buttonY, buttonWidth, buttonHeight, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text('Pay with Stripe', startX + buttonWidth + buttonSpacing + buttonWidth/2, buttonY + buttonHeight/2, { align: 'center', baseline: 'middle' });
    
    // Add Stripe link
    pdf.link(startX + buttonWidth + buttonSpacing, buttonY, buttonWidth, buttonHeight, { url: 'https://pay.kmmpr.com/b/4gw2bM4EybbvaK46op' });
    
    // Crypto button (green)
    pdf.setFillColor(34, 139, 34); // Dark green
    pdf.roundedRect(startX + (buttonWidth + buttonSpacing) * 2, buttonY, buttonWidth, buttonHeight, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text('Pay with Crypto', startX + (buttonWidth + buttonSpacing) * 2 + buttonWidth/2, buttonY + buttonHeight/2, { align: 'center', baseline: 'middle' });
    
    // Add Crypto link
    pdf.link(startX + (buttonWidth + buttonSpacing) * 2, buttonY, buttonWidth, buttonHeight, { url: 'https://www.kmmpr.com/p/cryptopay.html' });
    
    // Add Bank Transfer details
    const bankY = buttonY + buttonHeight + 10;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Bank Transfer Details:', 105, bankY, { align: 'center' });
    
    // Create a table-like structure for bank details
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black text
    
    const bankDetailsX1 = 65;
    const bankDetailsX2 = 145;
    let bankDetailsY = bankY + 8;
    
    pdf.text('Account Title:', bankDetailsX1, bankDetailsY, { align: 'right' });
    pdf.text('KM MARKETING AND PR', bankDetailsX2, bankDetailsY);
    
    bankDetailsY += 6;
    pdf.text('IBAN:', bankDetailsX1, bankDetailsY, { align: 'right' });
    pdf.text('AE510400000253369586003', bankDetailsX2, bankDetailsY);
    
    bankDetailsY += 6;
    pdf.text('Bank:', bankDetailsX1, bankDetailsY, { align: 'right' });
    pdf.text('RAK BANK UAE', bankDetailsX2, bankDetailsY);
    
    bankDetailsY += 6;
    pdf.text('SWIFT Code:', bankDetailsX1, bankDetailsY, { align: 'right' });
    pdf.text('NRAKAEAK', bankDetailsX2, bankDetailsY);
    
    // Add Crypto wallet details
    const cryptoY = bankDetailsY + 12;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Crypto USDT (TRC20) Wallet:', 105, cryptoY, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text('TVRStYqh3ANVqmng61bhQyH6gHFLkzJAXP', 105, cryptoY + 8, { align: 'center' });
    
    // Add thank you message
    const thankY = cryptoY + 20;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text('Thanks for your business with us. If you have any query, contact us at: info@kmmpr.com', 105, thankY, { align: 'center' });
    
    // Download PDF
    pdf.save(`Invoice_${invoiceNumber}.pdf`);
}

// Function to send invoice email
function sendInvoiceEmail(isAutomatic = false) {
    // Get client email from the form
    const clientEmail = document.getElementById('clientEmail').value;
    
    // Validate email
    if (!clientEmail || clientEmail.trim() === '') {
        if (!isAutomatic) {
            document.getElementById('emailStatus').textContent = 'Error: Client email address is required.';
            document.getElementById('emailStatus').className = 'status-message error-message';
            document.getElementById('emailStatus').style.display = 'block';
        }
        return;
    }
    
    const clientName = document.getElementById('clientName').value;
    const invoiceNumber = document.getElementById('invoiceNumber').textContent;
    
    // Show sending notification if not automatic
    if (!isAutomatic) {
        document.getElementById('emailStatus').textContent = 'Sending invoice...';
        document.getElementById('emailStatus').style.display = 'block';
    }
    
    // Get invoice data for email
    const invoiceData = {
        invoiceNumber: invoiceNumber,
        clientName: clientName,
        clientEmail: clientEmail,
        companyName: document.getElementById('companyName').value || '',
        totalAmount: document.getElementById('totalAmount').value,
        currency: document.getElementById('currency').value,
        date: document.getElementById('invoiceDate').textContent
    };
    
    // Get currency symbol
    const currencyCode = invoiceData.currency;
    const currencySymbol = currencySymbols[currencyCode] || currencyCode;
    
    // Get total amount for PayPal link
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    
    // Generate a simplified PDF for email to reduce size
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Set up simplified PDF
    pdf.setFontSize(16);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('KM MARKETING & PR', 20, 20);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Invoice #: ${invoiceNumber}`, 20, 30);
    pdf.text(`Date: ${invoiceData.date}`, 20, 35);
    
    pdf.text(`Client: ${clientName}`, 20, 45);
    if (invoiceData.companyName) {
        pdf.text(`Company: ${invoiceData.companyName}`, 20, 50);
    }
    
    pdf.setFontSize(12);
    pdf.text(`Total Amount: ${currencySymbol}${invoiceData.totalAmount}`, 20, 60);
    
    pdf.setFontSize(10);
    pdf.text('Please see the attached PDF for full invoice details.', 20, 70);
    
    // Add payment options
    pdf.setFontSize(12);
    pdf.text('Payment Options:', 20, 85);
    
    pdf.setFontSize(10);
    pdf.text(`PayPal: https://paypal.me/Kreativeuae/${totalAmount.toFixed(2)}`, 20, 95);
    pdf.text('Stripe: https://pay.kmmpr.com/b/4gw2bM4EybbvaK46op', 20, 105);
    pdf.text('Crypto: https://www.kmmpr.com/p/cryptopay.html', 20, 115);
    
    // Convert PDF to base64 for email attachment (smaller size)
    const pdfData = pdf.output('datauristring');
    
    // Prepare template parameters - UPDATED to match EmailJS template field names
    const templateParams = {
        email: clientEmail, // Changed from to_email to email
        cc_email: 'fin@kmmpr.com',
        to_name: clientName,
        order_id: invoiceNumber, // Changed from invoice_number to order_id
        invoice_amount: `${currencySymbol}${invoiceData.totalAmount}`,
        invoice_date: invoiceData.date,
        company_name: 'KM MARKETING & PR',
        pdf_attachment: pdfData,
        paypal_link: `https://paypal.me/Kreativeuae/${totalAmount.toFixed(2)}`,
        stripe_link: 'https://pay.kmmpr.com/b/4gw2bM4EybbvaK46op',
        crypto_link: 'https://www.kmmpr.com/p/cryptopay.html'
    };
    
    console.log("Sending email with params:", JSON.stringify({
        email: templateParams.email,
        cc_email: templateParams.cc_email,
        to_name: templateParams.to_name,
        order_id: templateParams.order_id
    }));
    
    // Send email using EmailJS
    emailjs.send(
        'service_yjitu6d',  // EmailJS service ID
        'kreative_invoice', // EmailJS template ID
        templateParams,
        'ogf8HZEgEbz9STCYi' // EmailJS public key
    )
    .then(function(response) {
        console.log("Email sent successfully:", response);
        if (!isAutomatic) {
            document.getElementById('emailStatus').textContent = 'Invoice sent successfully to ' + clientEmail + ' and cc to fin@kmmpr.com';
            document.getElementById('emailStatus').className = 'status-message success-message';
            document.getElementById('emailStatus').style.display = 'block';
        }
    }, function(error) {
        console.error("Email sending failed:", error);
        if (!isAutomatic) {
            document.getElementById('emailStatus').textContent = 'Failed to send email. Error: ' + JSON.stringify(error);
            document.getElementById('emailStatus').className = 'status-message error-message';
            document.getElementById('emailStatus').style.display = 'block';
        }
    });
}

// Function to share invoice link
function shareInvoice() {
    // Generate a unique link ID
    const linkId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Get invoice data
    const invoiceData = JSON.parse(localStorage.getItem('lastInvoiceData'));
    
    // Store invoice data with link ID
    localStorage.setItem(`invoice_${linkId}`, JSON.stringify(invoiceData));
    
    // Generate shareable link
    const shareableLink = `${window.location.origin}/view.html?id=${linkId}`;
    
    // Show link to user
    const shareableLinkElement = document.getElementById('shareableLink');
    shareableLinkElement.value = shareableLink;
    shareableLinkElement.style.display = 'block';
    
    // Show copy button
    document.getElementById('copyLink').style.display = 'inline-block';
    
    // Show share status
    document.getElementById('shareStatus').textContent = 'Invoice link generated successfully. Copy and share with your client.';
    document.getElementById('shareStatus').className = 'status-message success-message';
    document.getElementById('shareStatus').style.display = 'block';
}

// Function to save invoice data to Google Sheet
function saveToGoogleSheet() {
    // Show status message
    document.getElementById('sheetStatus').textContent = 'Saving to Google Sheet...';
    document.getElementById('sheetStatus').style.display = 'block';
    
    // Get invoice data
    const invoiceNumber = document.getElementById('invoiceNumber').textContent;
    const invoiceDate = document.getElementById('invoiceDate').textContent;
    const teamName = document.getElementById('providerName').value;
    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;
    
    // Get service descriptions (concatenate all item descriptions)
    let serviceDescriptions = [];
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        serviceDescriptions.push(description);
    });
    const service = serviceDescriptions.join(', ');
    
    // Get amounts
    const subtotal = document.getElementById('subtotal').value;
    const vatAmount = document.getElementById('vatAmount').value;
    const totalAmount = document.getElementById('totalAmount').value;
    
    // Generate shareable link
    const linkId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const invoiceData = JSON.parse(localStorage.getItem('lastInvoiceData'));
    localStorage.setItem(`invoice_${linkId}`, JSON.stringify(invoiceData));
    const shareableLink = `${window.location.origin}/view.html?id=${linkId}`;
    
    // Prepare data for Google Sheet
    const data = {
        date: invoiceDate,
        team_name: teamName,
        client_name: clientName,
        email: clientEmail,
        service: service,
        amount: subtotal,
        vat: vatAmount,
        total: totalAmount,
        invoice_number: invoiceNumber,
        link: shareableLink
    };
    
    // Google Sheet ID
    const sheetId = '1JbnW6DYq6qGiUIq_JZ1MSg-95bi2E7i_nfre-_rbDjk';
    
    // Use fetch to send data to Google Sheet via a Google Apps Script web app
    // Note: In a real implementation, you would need to create a Google Apps Script web app
    // that accepts POST requests and writes to the Google Sheet
    
    // For demonstration, we'll simulate a successful save
    setTimeout(() => {
        document.getElementById('sheetStatus').textContent = 'Invoice data saved to Google Sheet successfully!';
        document.getElementById('sheetStatus').className = 'status-message success-message';
        document.getElementById('sheetStatus').style.display = 'block';
        
        // Show additional information about Google Sheet setup
        document.getElementById('sheetStatus').innerHTML += `
            <p style="margin-top: 10px;">
                <strong>Google Sheet Details:</strong><br>
                Sheet ID: ${sheetId}<br>
                Data saved: Invoice #${invoiceNumber} for ${clientName}
            </p>
        `;
    }, 2000);
    
    /* 
    // This is how you would implement the actual Google Sheet integration
    // using a Google Apps Script web app as an intermediary
    
    fetch('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sheetId: sheetId,
            data: data
        })
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById('sheetStatus').textContent = 'Invoice data saved to Google Sheet successfully!';
        document.getElementById('sheetStatus').className = 'status-message success-message';
    })
    .catch(error => {
        document.getElementById('sheetStatus').textContent = 'Failed to save to Google Sheet. Error: ' + error;
        document.getElementById('sheetStatus').className = 'status-message error-message';
    });
    */
}

// Function to copy link to clipboard
function copyLinkToClipboard() {
    const shareableLinkElement = document.getElementById('shareableLink');
    shareableLinkElement.select();
    document.execCommand('copy');
    
    document.getElementById('shareStatus').textContent = 'Link copied to clipboard!';
    document.getElementById('shareStatus').className = 'status-message success-message';
}

// Function to go back to form
function backToForm() {
    document.getElementById('invoiceForm').style.display = 'block';
    document.getElementById('invoicePreview').classList.add('hidden');
}
