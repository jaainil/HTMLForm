document
  .getElementById("invoiceForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Check if terms and conditions are accepted
    const termsAccepted = document.getElementById("termsAccepted").checked;

    if (!termsAccepted) {
      alert("⚠️ કૃપા કરીને રજીસ્ટ્રેશન કરવા માટે નિયમો અને શરતો સ્વીકારો.");
      return;
    }

    // Show loading state
    const submitButton = document.querySelector(".navratri-btn");
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<span class="btn-text">🔄 રજીસ્ટ્રેશન પ્રક્રિયા ચાલુ છે...</span>';
    submitButton.disabled = true;

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
    };

    try {
      // Test NocoDB connection first
      console.log("🔍 સબમિશન પહેલા NocoDB કનેક્શન ચકાસી રહ્યા છીએ...");
      const connectionTest = await testNocoDBConnection();

      if (!connectionTest) {
        console.warn(
          "⚠️ NocoDB કનેક્શન નિષ્ફળ થયું, ફક્ત PDF સાથે આગળ વધી રહ્યા છીએ"
        );
        showNavratriErrorMessage(
          "⚠️ ડેટાબેઝ કનેક્શન નિષ્ફળ થયું. રજીસ્ટ્રેશન સ્થાનિક રીતે સાચવવામાં આવ્યું છે અને PDF જનરેટ થયું છે."
        );
        generateNavratriRegistrationPDF(formData);
        return;
      }

      // Submit data to NocoDB first
      console.log("📤 NocoDB પર ડેટા સબમિટ કરી રહ્યા છીએ...");
      const nocoResult = await submitToNocoDB(formData);

      if (nocoResult.success) {
        console.log("✅ NocoDB સબમિશન સફળ!");
        // Generate PDF only if NocoDB submission is successful
        generateNavratriRegistrationPDF(formData);

        // Show success message
        showNavratriSuccessMessage(
          "✅ રજીસ્ટ્રેશન સફળ! ડેટા ડેટાબેઝમાં સાચવવામાં આવ્યો અને PDF જનરેટ થયું."
        );
      } else {
        console.error("❌ NocoDB સબમિશન નિષ્ફળ:", nocoResult.error);
        // Show error message but still generate PDF
        showNavratriErrorMessage(
          `⚠️ ડેટાબેઝ સેવ નિષ્ફળ: ${nocoResult.error}. PDF સફળતાપૂર્વક જનરેટ થયું.`
        );
        generateNavratriRegistrationPDF(formData);
      }
    } catch (error) {
      console.error("💥 રજીસ્ટ્રેશન ભૂલ:", error);
      // Show error message but still generate PDF
      showNavratriErrorMessage(
        `⚠️ રજીસ્ટ્રેશન ભૂલ: ${error.message}. PDF સફળતાપૂર્વક જનરેટ થયું.`
      );
      generateNavratriRegistrationPDF(formData);
    } finally {
      // Restore button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
  });

// Calculate total amount based on number of persons
function calculateTotalAmount() {
  const totalPersons =
    parseInt(document.getElementById("totalPersons").value) || 0;
  const amountPerPerson = 1000; // ₹ 1000 પ્રતિ વ્યક્તિ (2 દિવસ માટે)
  const totalAmount = totalPersons * amountPerPerson;
  document.getElementById("totalAmount").value = totalAmount;
}

// Add event listener for total persons input
document
  .getElementById("totalPersons")
  .addEventListener("input", calculateTotalAmount);

function generateNavratriRegistrationPDF(data) {
  // Create a hidden div with the receipt content
  const receiptDiv = document.createElement("div");
  receiptDiv.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 800px;
    padding: 40px;
    background: white;
    font-family: 'Noto Sans Gujarati', sans-serif;
    color: #333;
    line-height: 1.6;
  `;

  receiptDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #FF6B6B; font-size: 32px; margin: 0; font-weight: bold;">માં ઉમિયાં યુવા ગ્રુપ</h1>
      <h2 style="color: #45B7D1; font-size: 24px; margin: 10px 0; font-weight: bold;">આણંદ નવરાત્રી આયોજન</h2>
      <p style="color: #666; font-size: 18px; margin: 5px 0;">27, 28/09/2025 (બે દિવસ)</p>
      <p style="color: #666; font-size: 14px; margin: 5px 0;">સંપર્ક: thechampstv9898@gmail.com | મદદ: 98250 45894</p>
      <div style="height: 3px; background: linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #FF8C42); margin: 20px 0;"></div>
      <h3 style="color: #FF8C42; font-size: 22px; margin: 20px 0; font-weight: bold;">રજીસ્ટ્રેશન રસીદ</h3>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div style="flex: 1; margin-right: 20px;">
        <h4 style="color: #45B7D1; font-size: 18px; margin-bottom: 15px; font-weight: bold;">સહભાગી વિગતો:</h4>
        <p style="margin: 8px 0; font-size: 16px;"><strong>નામ:</strong> ${
          data.fullName
        }</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>મોબાઈલ:</strong> ${
          data.phoneNumber
        }</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>કુલ વ્યક્તિઓ:</strong> ${
          data.totalPersons
        } (5 વર્ષથી ઉપર)</p>
        ${
          data.address
            ? `<p style="margin: 8px 0; font-size: 16px;"><strong>સરનામું:</strong> ${data.address}</p>`
            : ""
        }
        ${
          data.email
            ? `<p style="margin: 8px 0; font-size: 16px;"><strong>ઇમેઇલ:</strong> ${data.email}</p>`
            : ""
        }
      </div>
      
      <div style="flex: 1;">
        <h4 style="color: #FF8C42; font-size: 18px; margin-bottom: 15px; font-weight: bold;">રજીસ્ટ્રેશન માહિતી:</h4>
        <p style="margin: 8px 0; font-size: 16px;"><strong>રજીસ્ટ્રેશન #:</strong> ${
          data.invoiceNumber
        }</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>તારીખ:</strong> ${
          data.registrationDate
        }</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>દર:</strong> ₹ 1000 પ્રતિ વ્યક્તિ</p>
        <p style="margin: 8px 0; font-size: 16px;">(2 દિવસના કાર્યક્રમ માટે)</p>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 15px 30px; border: 3px solid #FF8C42; border-radius: 10px; background: #FFF8F0;">
        <h3 style="color: #FF6B6B; font-size: 24px; margin: 0; font-weight: bold;">કુલ: ₹ ${
          data.totalAmount
        }</h3>
      </div>
    </div>

    <div style="margin: 30px 0;">
      <h4 style="color: #FF6B6B; font-size: 18px; margin-bottom: 15px; font-weight: bold;">મહત્વપૂર્ણ સૂચનાઓ:</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin: 8px 0; font-size: 14px;">• રજીસ્ટ્રેશન ફરજિયાત છે - રજીસ્ટ્રેશન વગર પ્રવેશ મળશે નહીં</li>
        <li style="margin: 8px 0; font-size: 14px;">• રજીસ્ટ્રેશનની છેલ્લી તારીખ: 21/09/2025</li>
        <li style="margin: 8px 0; font-size: 14px;">• એક દિવસ માટે રજીસ્ટ્રેશન ઉપલબ્ધ નથી</li>
        <li style="margin: 8px 0; font-size: 14px;">• પ્રવેશ માટે આ રસીદ સાથે રાખો</li>
        <li style="margin: 8px 0; font-size: 14px;">• રજીસ્ટ્રેશન અથવા ચુકવણી અંગે સ્થળ પર કોઈ દલીલ નહીં</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #45B7D1; font-size: 20px; font-style: italic; margin: 20px 0;">જય માતાજી! નવરાત્રીની હાર્દિક શુભકામનાઓ!</p>
      <div style="height: 2px; background: linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #FF8C42); margin: 20px 0;"></div>
      <p style="color: #999; font-size: 12px; margin: 10px 0;">માં ઉમિયાં યુવા ગ્રુપ - આણંદ નવરાત્રી આયોજન 2025</p>
    </div>
  `;

  // Add to document
  document.body.appendChild(receiptDiv);

  // Wait for fonts to load, then generate PDF
  setTimeout(() => {
    html2canvas(receiptDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })
      .then((canvas) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Save the PDF
        const fileName = `નવરાત્રી_રજીસ્ટ્રેશન_${
          data.invoiceNumber
        }_${data.fullName.replace(/\s+/g, "_")}.pdf`;
        doc.save(fileName);

        // Remove the temporary div
        document.body.removeChild(receiptDiv);

        // Show success message
        showNavratriSuccessMessage(
          "નવરાત્રી રજીસ્ટ્રેશન રસીદ સફળતાપૂર્વક બની ગઈ!"
        );
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        document.body.removeChild(receiptDiv);
        showNavratriErrorMessage(
          "PDF બનાવવામાં ભૂલ થઈ. કૃપા કરીને ફરી પ્રયાસ કરો."
        );
      });
  }, 1000); // Wait 1 second for fonts to load
}

// NocoDB Configuration
const NOCODB_CONFIG = {
  baseUrl: "https://nocodb.algogist.com/api/v2",
  tableId: "mzse7xth1iba4ll",
  apiToken: "x46goXSDlBeSCSg98F9XcyF9k_2JTsRdUyh_BnpR",
  viewId: "vwvrz46hp9lkqx4r",
};

// Function to submit data to NocoDB
async function submitToNocoDB(formData) {
  console.log("🔄 NocoDB પર ડેટા સબમિટ કરવાનો પ્રયાસ કરી રહ્યા છીએ...");
  console.log("📊 સબમિટ કરવા માટેનો ફોર્મ ડેટા:", formData);

  try {
    // Use the correct field IDs from your NocoDB table
    const nocoData = {
      c05eqcynx057p0w: formData.fullName, // Full Name
      c930pe5xqlmciqi: formData.phoneNumber, // Phone Number
      c2oz9pyj7hjrwzv: parseInt(formData.totalPersons), // Total Participants
      coivwzyss4r41y5: formData.address || "", // Address
      cge82jeezj4fkd0: formData.email || "", // Email
      cuyo9tcmslimp4i: formData.registrationDate, // Registration Date
      c2w0421697ohkv6: parseInt(formData.totalAmount), // Total Amount
    };

    // Add registration number if you have a field for it
    // You'll need to provide the field ID for registration number
    // nocoData["REGISTRATION_NUMBER_FIELD_ID"] = formData.invoiceNumber;

    console.log("📤 ફિલ્ડ ID સાથે NocoDB પર મોકલી રહ્યા છીએ:", nocoData);
    console.log(
      "🔗 API URL:",
      `${NOCODB_CONFIG.baseUrl}/tables/${NOCODB_CONFIG.tableId}/records`
    );

    const response = await axios({
      method: "POST",
      url: `${NOCODB_CONFIG.baseUrl}/tables/${NOCODB_CONFIG.tableId}/records`,
      headers: {
        "xc-token": NOCODB_CONFIG.apiToken,
        "Content-Type": "application/json",
      },
      data: nocoData,
    });

    console.log(
      "✅ NocoDB માં ડેટા સફળતાપૂર્વક સાચવવામાં આવ્યો:",
      response.data
    );
    console.log("📋 પ્રતિભાવ સ્થિતિ:", response.status);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ NocoDB માં સાચવવામાં ભૂલ:", error);
    console.error("📄 ભૂલ વિગતો:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
}

// Function to test NocoDB connection
async function testNocoDBConnection() {
  console.log("🧪 NocoDB કનેક્શન ચકાસી રહ્યા છીએ...");
  try {
    const response = await axios({
      method: "GET",
      url: `${NOCODB_CONFIG.baseUrl}/tables/${NOCODB_CONFIG.tableId}/records`,
      headers: {
        "xc-token": NOCODB_CONFIG.apiToken,
      },
      params: {
        limit: 1,
      },
    });
    console.log("✅ NocoDB કનેક્શન પરીક્ષણ સફળ:", response.status);
    return true;
  } catch (error) {
    console.error("❌ NocoDB કનેક્શન પરીક્ષણ નિષ્ફળ:", error);
    console.error("📄 કનેક્શન ભૂલ વિગતો:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return false;
  }
}

// Function to get all field IDs from NocoDB table
async function getAllFieldIds() {
  try {
    console.log("🔍 બધા ફિલ્ડ ID મેળવવા માટે ટેબલ સ્કીમા ફેચ કરી રહ્યા છીએ...");

    // Get table info including field details - using the correct API endpoint
    const response = await axios({
      method: "GET",
      url: `${NOCODB_CONFIG.baseUrl}/meta/tables/${NOCODB_CONFIG.tableId}`,
      headers: {
        "xc-token": NOCODB_CONFIG.apiToken,
      },
    });

    console.log("📋 ટેબલ સ્કીમા પ્રતિભાવ:", response.data);

    if (response.data && response.data.columns) {
      console.log("📊 બધા ફિલ્ડ ID અને નામો:");
      response.data.columns.forEach((column) => {
        console.log(`${column.title}: ${column.id}`);
      });
      return response.data.columns;
    }

    return null;
  } catch (error) {
    console.error("❌ ફિલ્ડ ID ફેચ કરવામાં ભૂલ:", error);
    console.log(
      "💡 આ ડેટા સબમિશનને અસર કરતું નથી - તે ફક્ત ફિલ્ડ મેપિંગને ડીબગ કરવા માટે છે"
    );
    return null;
  }
}

// Function to show success message
function showNavratriSuccessMessage(message) {
  // Create success message element with Navratri theme
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049, #66BB6A);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        z-index: 1000;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        font-weight: 600;
        animation: navratiSlideIn 0.5s ease-out;
        border: 2px solid rgba(255, 255, 255, 0.3);
        max-width: 350px;
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

  // Remove message after 5 seconds
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
  }, 5000);
}

// Function to show error message
function showNavratriErrorMessage(message) {
  // Create error message element with warning theme
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #FF9800, #F57C00, #FFB74D);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
        z-index: 1000;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        font-weight: 600;
        animation: navratiSlideIn 0.5s ease-out;
        border: 2px solid rgba(255, 255, 255, 0.3);
        max-width: 350px;
    `;

  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  // Remove message after 6 seconds (longer for error messages)
  setTimeout(() => {
    errorDiv.style.animation = "navratiSlideIn 0.5s ease-out reverse";
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 500);
  }, 6000);
}

// Function to generate unique invoice number
function generateUniqueInvoiceNumber() {
  // Get current timestamp
  const timestamp = Date.now();

  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  // Add random component for extra uniqueness
  const randomComponent = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  // Create unique invoice number: NAV-YYMMDD-TIMESTAMP-RANDOM
  const invoiceNumber = `NAV-${year}${month}${day}-${timestamp
    .toString()
    .slice(-6)}-${randomComponent}`;

  return invoiceNumber;
}

// Function to check and ensure uniqueness (using localStorage with better handling)
function getUniqueInvoiceNumber() {
  let invoiceNumber;
  let attempts = 0;
  const maxAttempts = 1000; // Increased from 100 to 1000

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

      // Keep only last 5000 invoice numbers to handle more registrations
      if (usedInvoices.length > 5000) {
        usedInvoices.splice(0, usedInvoices.length - 5000);
      }

      localStorage.setItem("usedInvoiceNumbers", JSON.stringify(usedInvoices));
      break;
    }

    // Add small delay to prevent rapid-fire duplicates
    if (attempts % 10 === 0) {
      // Every 10 attempts, add a tiny delay
      const start = Date.now();
      while (Date.now() - start < 1) {
        // 1ms delay
      }
    }
  } while (attempts < maxAttempts);

  // If we somehow still get a duplicate after 1000 attempts,
  // fall back to timestamp-based guaranteed unique number
  if (attempts >= maxAttempts) {
    const timestamp = Date.now();
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");

    // Use full timestamp for absolute uniqueness
    invoiceNumber = `NAV-${year}${month}${day}-${timestamp
      .toString()
      .slice(-8)}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")}`;

    // Store this fallback number too
    const usedInvoices = JSON.parse(
      localStorage.getItem("usedInvoiceNumbers") || "[]"
    );
    usedInvoices.push(invoiceNumber);
    localStorage.setItem("usedInvoiceNumbers", JSON.stringify(usedInvoices));
  }

  return invoiceNumber;
}

// Set today's date as default
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("registrationDate").value = today;

  // Generate unique registration number
  const registrationNumber = getUniqueInvoiceNumber();
  document.getElementById("invoiceNumber").value = registrationNumber;

  // Test NocoDB connection on page load
  console.log("🚀 પેજ લોડ થયું, NocoDB કનેક્શન ચકાસી રહ્યા છીએ...");
  testNocoDBConnection().then((success) => {
    if (success) {
      console.log("✅ NocoDB રજીસ્ટ્રેશન માટે તૈયાર છે!");

      // Fetch all field IDs for reference
      getAllFieldIds().then((fields) => {
        if (fields) {
          console.log(
            "📋 ફિલ્ડ મેપિંગ પૂર્ણ! બધા ફિલ્ડ ID માટે ઉપર કન્સોલ તપાસો."
          );
        }
      });
    } else {
      console.warn("⚠️ NocoDB કનેક્શન સમસ્યાઓ મળી. વિગતો માટે કન્સોલ તપાસો.");
    }
  });

  // Calculate amount when persons change
  document
    .getElementById("totalPersons")
    .addEventListener("input", calculateTotalAmount);

  // Handle terms and conditions checkbox
  const termsCheckbox = document.getElementById("termsAccepted");
  const submitButton = document.querySelector(".navratri-btn");

  // Update button state based on terms acceptance
  function updateButtonState() {
    if (termsCheckbox.checked) {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      submitButton.style.cursor = "pointer";
    } else {
      submitButton.disabled = true;
      submitButton.style.opacity = "0.6";
      submitButton.style.cursor = "not-allowed";
    }
  }

  // Initial button state
  updateButtonState();

  // Listen for checkbox changes
  termsCheckbox.addEventListener("change", updateButtonState);

  // Generate new registration number when form is reset
  document.getElementById("invoiceForm").addEventListener("reset", function () {
    setTimeout(() => {
      const newRegistrationNumber = getUniqueInvoiceNumber();
      document.getElementById("invoiceNumber").value = newRegistrationNumber;
      document.getElementById("totalAmount").value = "";
      updateButtonState();
    }, 100);
  });
});
