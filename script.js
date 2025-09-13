document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const formData = {
    fullName: document.getElementById("fullName").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    totalPersons: document.getElementById("totalPersons").value,
    address: document.getElementById("address").value,
    email: document.getElementById("email").value,
    invoiceNumber: document.getElementById("invoiceNumber").value,
    registrationDate: document.getElementById("registrationDate").value,
    totalAmount: document.getElementById("totalAmount").value,
    sponsorship: document.getElementById("sponsorship").value,
  };

  // Generate PDF
  generateNavratriRegistrationPDF(formData);
});

// Calculate total amount based on number of persons
function calculateTotalAmount() {
  const totalPersons =
    parseInt(document.getElementById("totalPersons").value) || 0;
  const amountPerPerson = 1000; // Rs. 1000 per person for 2 days
  const totalAmount = totalPersons * amountPerPerson;
  document.getElementById("totalAmount").value = totalAmount;
}

// Add event listener for total persons input
document
  .getElementById("totalPersons")
  .addEventListener("input", calculateTotalAmount);

function generateNavratriRegistrationPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set colors for Navratri theme
  const navratriColors = {
    red: [255, 107, 107],
    yellow: [255, 230, 109],
    green: [78, 205, 196],
    blue: [69, 183, 209],
    orange: [255, 140, 66],
  };

  // Background gradient effect (simplified for PDF)
  doc.setFillColor(255, 248, 240);
  doc.rect(0, 0, 210, 297, "F");

  // Decorative border
  doc.setDrawColor(
    navratriColors.red[0],
    navratriColors.red[1],
    navratriColors.red[2]
  );
  doc.setLineWidth(3);
  doc.rect(10, 10, 190, 277);

  // Inner decorative border
  doc.setDrawColor(
    navratriColors.yellow[0],
    navratriColors.yellow[1],
    navratriColors.yellow[2]
  );
  doc.setLineWidth(1);
  doc.rect(15, 15, 180, 267);

  // Title with Navratri theme
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.red[0],
    navratriColors.red[1],
    navratriColors.red[2]
  );
  doc.text("MAA UMIYA YUVA GROUP", 105, 32, { align: "center" });

  // Event details
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.blue[0],
    navratriColors.blue[1],
    navratriColors.blue[2]
  );
  doc.text("ANAND NAVRATRI AYOJAN", 105, 42, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("27, 28/09/2025 (Two Days Event)", 105, 52, { align: "center" });

  // Contact info
  doc.setFontSize(10);
  doc.text("Contact: thechampstv9898@gmail.com | Help: 98250 45894", 105, 62, {
    align: "center",
  });

  // Decorative line
  doc.setDrawColor(
    navratriColors.green[0],
    navratriColors.green[1],
    navratriColors.green[2]
  );
  doc.setLineWidth(2);
  doc.line(30, 72, 180, 72);

  // Registration Receipt Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.orange[0],
    navratriColors.orange[1],
    navratriColors.orange[2]
  );
  doc.text("REGISTRATION RECEIPT", 105, 87, { align: "center" });

  // Registration details
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Left column - Participant Information
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.blue[0],
    navratriColors.blue[1],
    navratriColors.blue[2]
  );
  doc.text("Participant Details:", 25, 107);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${data.fullName}`, 25, 117);
  doc.text(`Mobile: ${data.phoneNumber}`, 25, 127);
  doc.text(`Total Persons: ${data.totalPersons} (Above 5 years)`, 25, 137);
  if (data.address && data.address.trim() !== "") {
    const addressLines = doc.splitTextToSize(`Address: ${data.address}`, 80);
    doc.text(addressLines, 25, 147);
  }
  if (data.email && data.email.trim() !== "") {
    doc.text(`Email: ${data.email}`, 25, data.address ? 157 : 147);
  }

  // Right column - Registration Information
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.orange[0],
    navratriColors.orange[1],
    navratriColors.orange[2]
  );
  doc.text("Registration Info:", 110, 107);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Better formatted registration number
  doc.setFont("helvetica", "bold");
  doc.text(`Reg. No: ${data.invoiceNumber}`, 110, 117);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${data.registrationDate}`, 110, 127);
  doc.text(`Rate: Rs. 1000 per person`, 110, 137);
  doc.text(`(For 2 days event)`, 110, 147);

  // Calculate starting Y position for next section
  let currentY = 170;

  // Sponsorship section - ONLY if sponsorship is provided
  if (data.sponsorship && data.sponsorship.trim() !== "") {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      navratriColors.green[0],
      navratriColors.green[1],
      navratriColors.green[2]
    );
    doc.text("Sponsorship/Support:", 25, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const splitSponsorship = doc.splitTextToSize(data.sponsorship, 160);
    doc.text(splitSponsorship, 25, currentY + 10);

    currentY = currentY + 10 + splitSponsorship.length * 10 + 20;
  } else {
    currentY = 180;
  }

  // Total amount with decorative box
  const totalY = currentY;
  doc.setDrawColor(
    navratriColors.orange[0],
    navratriColors.orange[1],
    navratriColors.orange[2]
  );
  doc.setFillColor(255, 248, 240);
  doc.setLineWidth(2);
  doc.rect(110, totalY - 10, 80, 25, "FD");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.red[0],
    navratriColors.red[1],
    navratriColors.red[2]
  );
  doc.text(`Total: Rs. ${data.totalAmount}`, 150, totalY + 5, {
    align: "center",
  });

  // Important instructions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    navratriColors.red[0],
    navratriColors.red[1],
    navratriColors.red[2]
  );
  doc.text("IMPORTANT INSTRUCTIONS:", 25, totalY + 35);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const instructions = [
    "• Registration is mandatory for entry",
    "• Last date for registration: 21/09/2025",
    "• No single day registration available",
    "• Bring this receipt for entry",
    "• No arguments at venue regarding registration",
  ];

  instructions.forEach((instruction, index) => {
    doc.text(instruction, 25, totalY + 45 + index * 8);
  });

  // Blessing message
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(
    navratriColors.blue[0],
    navratriColors.blue[1],
    navratriColors.blue[2]
  );
  doc.text("Jai Mataji! Navratri ni Hardik Shubhkamnaao!", 105, totalY + 90, {
    align: "center",
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Maa Umiya Yuva Group - Anand Navratri Ayojan 2025",
    105,
    totalY + 105,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `Navratri_Registration_${
    data.invoiceNumber
  }_${data.fullName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);

  // Show success message
  showNavratriSuccessMessage("Registration receipt generated successfully!");
}

function showNavratriSuccessMessage(message) {
  // Create success message element with Navratri theme
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #FF8C42);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
        font-size: 16px;
        font-weight: 600;
        animation: navratiSlideIn 0.5s ease-out;
        border: 2px solid rgba(255, 255, 255, 0.3);
    `;

  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes navratiSlideIn {
            from {
                transform: translateX(100%) rotate(5deg);
                opacity: 0;
            }
            to {
                transform: translateX(0) rotate(0deg);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);

  // Remove message after 4 seconds
  setTimeout(() => {
    successDiv.style.animation = "navratiSlideIn 0.5s ease-out reverse";
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 500);
  }, 4000);
}

// Function to generate unique invoice number
function generateUniqueInvoiceNumber() {
  // Get current timestamp for maximum uniqueness
  const timestamp = Date.now();

  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  // Add random component for extra uniqueness (4 digits)
  const randomComponent = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  // Create highly unique invoice number: NAV25-MMDD-TIMESTAMP-RANDOM
  // This gives us billions of possible combinations
  const invoiceNumber = `NAV${year}-${month}${day}-${timestamp
    .toString()
    .slice(-8)}-${randomComponent}`;

  return invoiceNumber;
}

// Function to check and ensure uniqueness (using localStorage)
function getUniqueInvoiceNumber() {
  let invoiceNumber;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    invoiceNumber = generateUniqueInvoiceNumber();
    attempts++;

    // Check if this invoice number was used before (stored in localStorage)
    const usedInvoices = JSON.parse(
      localStorage.getItem("usedInvoiceNumbers") || "[]"
    );

    if (!usedInvoices.includes(invoiceNumber)) {
      // Store this invoice number as used
      usedInvoices.push(invoiceNumber);

      // Keep only last 1000 invoice numbers to prevent localStorage from growing too large
      if (usedInvoices.length > 1000) {
        usedInvoices.splice(0, usedInvoices.length - 1000);
      }

      localStorage.setItem("usedInvoiceNumbers", JSON.stringify(usedInvoices));
      break;
    }
  } while (attempts < maxAttempts);

  return invoiceNumber;
}

// Set today's date as default
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("registrationDate").value = today;

  // Generate unique registration number
  const registrationNumber = getUniqueInvoiceNumber();
  document.getElementById("invoiceNumber").value = registrationNumber;

  // Calculate amount when persons change
  document
    .getElementById("totalPersons")
    .addEventListener("input", calculateTotalAmount);

  // Generate new registration number when form is reset
  document.getElementById("invoiceForm").addEventListener("reset", function () {
    setTimeout(() => {
      const newRegistrationNumber = getUniqueInvoiceNumber();
      document.getElementById("invoiceNumber").value = newRegistrationNumber;
      document.getElementById("totalAmount").value = "";
    }, 100);
  });
});
