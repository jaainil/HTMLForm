document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const formData = {
    fullName: document.getElementById("fullName").value,
    gender: document.getElementById("gender").value,
    address: document.getElementById("address").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    email: document.getElementById("email").value,
    invoiceNumber: document.getElementById("invoiceNumber").value,
    invoiceDate: document.getElementById("invoiceDate").value,
    amount: document.getElementById("amount").value,
    description: document.getElementById("description").value,
  };

  // Generate PDF
  generateInvoicePDF(formData);
});

function generateInvoicePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set font sizes
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");

  // Title
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Invoice details
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Left column - Customer Information
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.fullName}`, 20, 60);
  doc.text(
    `Gender: ${data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}`,
    20,
    70
  );
  doc.text(`Address: ${data.address}`, 20, 80);
  doc.text(`Phone: ${data.phoneNumber}`, 20, 90);
  doc.text(`Email: ${data.email}`, 20, 100);

  // Right column - Invoice Information
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details:", 120, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${data.invoiceNumber}`, 120, 60);
  doc.text(`Date: ${data.invoiceDate}`, 120, 70);
  doc.text(`Amount: $${parseFloat(data.amount).toFixed(2)}`, 120, 80);

  // Description section
  doc.setFont("helvetica", "bold");
  doc.text("Description:", 20, 130);
  doc.setFont("helvetica", "normal");

  // Split description into multiple lines if needed
  const splitDescription = doc.splitTextToSize(data.description, 170);
  doc.text(splitDescription, 20, 140);

  // Total amount
  const totalY = 140 + splitDescription.length * 10 + 20;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: $${parseFloat(data.amount).toFixed(2)}`, 120, totalY);

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you!", 105, totalY + 30, {
    align: "center",
  });

  // Save the PDF
  const fileName = `invoice_${data.invoiceNumber}_${data.fullName.replace(
    /\s+/g,
    "_"
  )}.pdf`;
  doc.save(fileName);

  // Show success message
  showSuccessMessage("Invoice PDF generated successfully!");
}

function showSuccessMessage(message) {
  // Create success message element
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
    `;

  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);

  // Remove message after 3 seconds
  setTimeout(() => {
    successDiv.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => {
      document.body.removeChild(successDiv);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

// Set today's date as default
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("invoiceDate").value = today;

  // Generate random invoice number
  const invoiceNumber = "INV-" + Date.now().toString().slice(-6);
  document.getElementById("invoiceNumber").value = invoiceNumber;
});
