function calculateBets() {
  let targetAmount = parseFloat(document.getElementById("target-amount").value);
  let odds = parseFloat(document.getElementById("odds").value || 1.8);
  let startingCapital = parseFloat(
    document.getElementById("starting-capital").value || 2
  );
  let savingsPercentage = parseFloat(
    document.getElementById("savings-percentage").value
  );

  let betCount = 0;
  let currentCapital = startingCapital;
  let totalSaved = 0;
  let resultRows = [];

  while (currentCapital < targetAmount) {
    let betAmount = currentCapital * savingsPercentage;
    totalSaved += betAmount;
    currentCapital += betAmount * odds;
    betCount++;
    resultRows.push(
      `<tr><td>${betCount}</td><td>${betAmount.toFixed(
        2
      )}</td><td>${totalSaved.toFixed(2)}</td><td>${(
        currentCapital - totalSaved
      ).toFixed(2)}</td></tr>`
    );
  }

  let estimatedDuration = 2.5 * betCount;

  let resultTable = `
            <h2>Target Amount (${targetAmount.toFixed(
              2
            )}) reached or crossed!</h2>
            <h2>Final Results:</h2>
            <table>
            <thead>
            <tr>
            <th>Bet Number</th>
            <th>Current Bet Amount</th>
            <th>Total Amount Won</th>
            <th>Current Capital</th>
            </tr>
            </thead>
            <tbody>
            ${resultRows.join("")}
            </tbody>
            </table>
            <p>Total Bets Placed: ${betCount}</p>
            <p>Final Capital: ${currentCapital.toFixed(2)}</p>
            <p>Total Amount Saved: ${totalSaved.toFixed(2)}</p>
            <p>Estimated Time to Reach the Limit: ${estimatedDuration.toFixed(
              2
            )} hours</p>
            `;

  document.getElementById("result-container").innerHTML = resultTable;
  document.getElementById("result-container").style.display = "block";
}

function sanitizeInput() {
  let input = document.getElementById("input-odds");
  input.value = input.value.replace(/[^\d.\n ]/g, "");
}

function calculateProbabilities() {
  let inputOdds = document.getElementById("input-odds").value;
  let odds = inputOdds.trim().split(/\s+/);

  if (odds.length === 0) {
    return;
  }

  let table = document.getElementById("probabilities-table");
  let tbody = table.getElementsByTagName("tbody")[0];

  let timestamp = formatDateForCSV(new Date()); // Get current timestamp formatted for CSV

  for (let i = 0; i < odds.length; i += 3) {
    let currentOdds = odds.slice(i, i + 3);

    // Skip incomplete odds
    if (currentOdds.length !== 3) {
      continue;
    }

    let homeProb = Math.round((100 / parseFloat(currentOdds[0])) * 100) / 100;
    let drawProb = Math.round((100 / parseFloat(currentOdds[1])) * 100) / 100;
    let awayProb = Math.round((100 / parseFloat(currentOdds[2])) * 100) / 100;

    let row = document.createElement("tr");
    row.innerHTML = `<td>${timestamp}</td><td>${currentOdds.join(
      " "
    )}</td><td>${homeProb}%</td><td>${drawProb}%</td><td>${awayProb}%</td>`;
    tbody.insertBefore(row, tbody.firstChild);
  }

  // Clear the input box
  document.getElementById("input-odds").value = "";

  // Sort table rows based on timestamp (newest first)
  let rows = Array.from(tbody.getElementsByTagName("tr"));
  rows.sort(function (a, b) {
    let timestampA = new Date(a.cells[0].textContent);
    let timestampB = new Date(b.cells[0].textContent);
    return timestampB - timestampA;
  });
  rows.forEach(function (row) {
    tbody.appendChild(row);
  });

  // Store table data in local storage
  let tableData = tbody.innerHTML;
  localStorage.setItem("tableData", tableData);
}

// Function to format the timestamp for CSV
function formatDateForCSV(date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  let seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function downloadTableData() {
  let tableData = localStorage.getItem("tableData");
  if (!tableData) {
    return;
  }

  let filename = "table_data.html";
  let dataTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Table Data</title>
            <style>
            /* Custom CSS for the downloaded table */
            table {
            width: 100%;
            border-collapse: collapse;
            }

            th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            }

            th {
            background-color: #f2f2f2;
            color: #333;
            }

            tr:nth-child(even) {
            background-color: #f9f9f9;
            }

            tr:hover {
            background-color: #e3e3e3;
            }
            </style>
            </head>
            <body>
            <table>
            ${tableData}
            </table>
            </body>
            </html>
            `;

  let link = document.createElement("a");
  link.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(dataTemplate)
  );
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadTableDataCSV() {
  let table = document.getElementById("probabilities-table");
  let headers = table.querySelectorAll("th");
  let rows = table.querySelectorAll("tbody tr");

  let csvContent = "data:text/csv;charset=utf-8,";

  // Add table headers to CSV content
  let headerRow = Array.from(headers).map((header) => header.textContent);
  csvContent += headerRow.join(",") + "\n";

  // Add table data rows to CSV content
  rows.forEach((row) => {
    let rowData = Array.from(row.cells).map((cell) => cell.textContent);
    csvContent += rowData.join(",") + "\n";
  });

  // Create a temporary link and trigger the download
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "table_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Load table data from local storage on page load
window.addEventListener("DOMContentLoaded", function () {
  let tableData = localStorage.getItem("tableData");
  if (tableData) {
    let tbody = document
      .getElementById("probabilities-table")
      .getElementsByTagName("tbody")[0];
    tbody.innerHTML = tableData;
  }
});

// Function to fix the timestamp format in the table data
function fixTimestampFormat(tableData) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(tableData, "text/html");
  let rows = doc.querySelectorAll("tr");

  for (const element of rows) {
    let cells = element.querySelectorAll("td");
    let timestamp = new Date(cells[0].textContent).toLocaleString(); // Correct the timestamp format
    cells[0].textContent = timestamp;
  }

  return doc.body.innerHTML;
}

function clearLocalStorage() {
  let confirmation = confirm(
    "Are you sure you want to clear the local storage?"
  );
  if (confirmation) {
    localStorage.clear();
    alert("Local storage has been cleared.");
  }
}

function loadDataFromCSV() {
  let fileInput = document.getElementById("csv-file");
  let file = fileInput.files[0];
  let reader = new FileReader();

  reader.onload = function (event) {
    let csvData = event.target.result;
    let parsedData = parseCSV(csvData);

    if (parsedData) {
      updateTableWithCSVData(parsedData);
      alert("CSV data loaded successfully.");
    } else {
      alert("Failed to parse CSV data.");
    }
  };

  reader.readAsText(file);
}

function parseCSV(csvData) {
  let lines = csvData.split("\n");
  let parsedData = [];

  for (const element of lines) {
    let line = element.trim();

    if (line === "") {
      continue; // Skip empty lines
    }

    let fields = line.split(",");
    parsedData.push(fields);
  }

  return parsedData;
}

function updateTableWithCSVData(data) {
  let table = document.getElementById("probabilities-table");
  let tbody = table.getElementsByTagName("tbody")[0];

  // Clear existing table rows
  tbody.innerHTML = "";

  // Add new rows based on the CSV data (start from index 1 to skip the header)
  for (let i = 1; i < data.length; i++) {
    let row = document.createElement("tr");
    for (const element of data[i]) {
      let cell = document.createElement("td");
      cell.textContent = element;
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let scrollToTopButton = document.getElementById("scrollToTopButton");
  let scrollToBottomButton = document.getElementById("scrollToBottomButton");

  // Scroll to top of the page
  scrollToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Scroll to bottom of the page
  scrollToBottomButton.addEventListener("click", function () {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  });
});
