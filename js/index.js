// Define the event listener setup function
function setupCheckboxEventListeners() {
    // Add an event listener to all checkbox elements with class "stage-checkbox"
    const checkboxes = document.querySelectorAll('.stage-checkbox');

    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            updateProgress(checkboxes);
        });
    });
}


function calculateBets() {
    const targetAmountInput = document.getElementById("target-amount");
    const oddsInput = document.getElementById("odds");
    const startingCapitalInput = document.getElementById("starting-capital");
    const savingsPercentageInput = document.getElementById("savings-percentage");

    const targetAmount = parseFloat(targetAmountInput.value);
    const odds = parseFloat(oddsInput.value) || 1.8;
    const startingCapital = parseFloat(startingCapitalInput.value) || 3;
    const savingsPercentage = parseFloat(savingsPercentageInput.value) || 0;

    if (isNaN(targetAmount) || isNaN(odds) || isNaN(startingCapital) || isNaN(savingsPercentage)) {
        alert("Please enter valid numeric values.");
        return;
    }

    let betCount = 1;
    let currentCapital = startingCapital;
    let totalSaved = 0;
    let resultRows = [];
    let betAmount = startingCapital;

    while (currentCapital < targetAmount) {
        if (betCount > 1) {
            betAmount = currentCapital * (1 - savingsPercentage);
            totalSaved += betAmount * savingsPercentage;
        }

        const amountWon = betAmount * odds;
        currentCapital += amountWon - betAmount;

        resultRows.push(`
      <tr>
        <td>${betCount}</td>
        <td>${betAmount.toFixed(2)}</td>
        <td>${amountWon.toFixed(2)}</td>
        <td>${(currentCapital * savingsPercentage).toFixed(2)}</td>
        <td>${currentCapital.toFixed(2)}</td>
        <td><input type="checkbox" id="stage-${betCount}"  class="stage-checkbox"></td>
      </tr>
    `);

        betCount++;
    }

    const estimatedDuration = betCount * 2.5; // Modify this as needed.

    const resultTable = `
    <h2>Target Amount (${targetAmount.toFixed(2)}) reached or crossed!</h2>
    <h2>Final Results:</h2>
    <table>
      <thead>
        <tr>
          <th>Bet Number</th>
          <th>Bet Amount</th>
          <th>Amount Won</th>
          <th>Save Amount</th>
          <th>Current Capital</th>
          <th>Check</th>
        </tr>
      </thead>
      <tbody>
        ${resultRows.join("")}
      </tbody>
    </table>
    <p>Bets To Be Placed: ${betCount - 1}</p>
    <p>Final Capital: ${currentCapital.toFixed(2)}</p>
    <p>Total Amount Saved: ${totalSaved.toFixed(2)}</p>
    <p>Estimated Time to Reach the Limit: ${estimatedDuration.toFixed(2)} hours</p>

    <!-- Progress Bar -->
    <div id="progress-bar" style="background-color: #007acc; height: 20px; width: 0;"></div>

    <!-- Progress Percentage -->
    <div id="progress-percentage">0%</div>
  `;

    document.getElementById("result-container").innerHTML = resultTable;
    document.getElementById("result-container").style.display = "block";
    setupCheckboxEventListeners();
}


function updateProgress(checkboxes) { // Accept the checkboxes array as an argument
    // Implement your progress update logic here
    // For example, you can count the number of checked checkboxes
    const checkedCheckboxes = document.querySelectorAll('.stage-checkbox:checked');
    const progress = (checkedCheckboxes.length / checkboxes.length) * 100;

    // Update a progress bar or display the progress percentage
    // Example: Update a progress bar with an id "progress-bar"
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }

    // You can also display the progress percentage in an element with an id "progress-percentage"
    const progressPercentage = document.getElementById('progress-percentage');
    if (progressPercentage) {
        progressPercentage.textContent = progress.toFixed(2) + '%';
    }
}


function sanitizeInput() {
    let input = document.getElementById("input-odds");
    input.value = input.value.replace(/[^\d.\n ]/g, "");
}

function handleKeyDown(event) {
    if (event.keyCode === 13) { // Enter key code is 13
        event.preventDefault(); // prevent form from submission
        calculateProbabilities();
    }
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
    document.getElementById("input-odds").select();

    // Sort table rows based on timestamp (newest first)
    let rows = Array.from(tbody.getElementsByTagName("tr"));
    rows.sort(function(a, b) {
        let timestampA = new Date(a.cells[0].textContent);
        let timestampB = new Date(b.cells[0].textContent);
        return timestampB - timestampA;
    });
    rows.forEach(function(row) {
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
window.addEventListener("DOMContentLoaded", function() {
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

    reader.onload = function(event) {
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

document.addEventListener("DOMContentLoaded", function() {
    let scrollToTopButton = document.getElementById("scrollToTopButton");
    let scrollToBottomButton = document.getElementById("scrollToBottomButton");

    // Scroll to top of the page
    scrollToTopButton.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

    // Scroll to bottom of the page
    scrollToBottomButton.addEventListener("click", function() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    });
});

$(document).ready(function() {
    // Show the loading screen
    $('#loading-screen').show();

    var upcomingTable = loadTable("csv/upcoming.csv", "dataTable");
    var pastTable = loadTable("csv/past.csv", "dataTable1");

    // Find the <input> element by its id
    var pastDateInput = document.getElementById('past-date-filter');

    // Get the current date
    var today = new Date();

    // Format the date as yyyy-MM-dd
    var formattedDate = today.toISOString().slice(0, 10);

    // Set the max attribute to the current date
    pastDateInput.max = formattedDate;

    // Generate a list of the next 7 days for the upcoming date filter
    var today = new Date();
    var next7Days = [today];
    for (var i = 1; i <= 6; i++) {
        var nextDay = new Date();
        nextDay.setDate(today.getDate() + i);
        next7Days.push(nextDay);
    }
    generateUpcomingDateOptions(next7Days);

    // Event handler for the upcoming date filter
    $("#upcoming-date-filter").change(function() {
        var selectedDate = $(this).val();
        var ariaControls = $(this).attr("aria-controls");
        var targetInput = $("input[aria-controls='" + ariaControls + "']");
        targetInput.val(selectedDate).trigger('input');
    });

    // Event handler for the past date filter
    $("#past-date-filter").change(function() {
        var selectedDate = $(this).val();
        var ariaControls = $(this).attr("aria-controls");
        var targetInput = $("input[aria-controls='" + ariaControls + "']");
        targetInput.val(selectedDate).trigger('input');
    });

    // Attach an event listener to the DataTable rows for displaying details
    $('#dataTable tbody').on('click', 'tr', function() {
        var data = upcomingTable.row(this).data();
        var columnNames = upcomingTable.columns().header().toData();

        if (data) {
            var details = formatRowDetails(data, columnNames);
            $('#row-details-container').html(details);
        }
    });

    $('#dataTable1 tbody').on('click', 'tr', function() {
        var data = pastTable.row(this).data();
        var columnNames = pastTable.columns().header().toData();

        if (data) {
            var details = formatRowDetails(data, columnNames);
            $('#row-details-container').html(details);
        }
    });

});

function loadTable(csvFile, tableId) {
    $.get(csvFile, function(data) {
        Papa.parse(data, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                var filteredData = results.data.filter(function(row) {
                    return Object.values(row).every(
                        (value) => value !== null && value !== undefined
                    );
                });

                if ($.fn.DataTable.isDataTable("#" + tableId)) {
                    $("#" + tableId).DataTable().destroy();
                }

                $("#" + tableId).empty();
                $("#" + tableId).DataTable({
                    data: filteredData,
                    paginate: true,
                    columns: getColumns(results.meta.fields),
                    scrollY: "100%",
                    scrollX: true,
                    scrollCollapse: true,
                    // autoWidth: false,
                    columnDefs: [{
                            targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, -1, -2, -3, -4, -5, -6, -7, -8, -9],
                            className: 'shrink-style'
                        },
                        {
                            targets: ['Total Goals Prediction'],
                            className: 'shrink-style'
                        },
                        {
                            targets: ['Goal Difference'],
                            className: 'shrink-style'
                        },
                        {
                            targets: ['O U Pred'],
                            className: 'shrink-style'
                        },
                        { width: '80px', targets: [0] },
                        { width: '150px', targets: [1] },
                    ]
                });
                // Add a click event to rows in the table
                $("#" + tableId + " tbody").on("click", "tr", function() {
                    var table = $("#" + tableId).DataTable();
                    var tr = $(this);
                    var row = table.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open, so close it
                        row.child.hide();
                        tr.removeClass("shown");
                    } else {
                        // Open the row to show complete details
                        row.child(formatRowDetails(row.data(), results.meta.fields)).show();
                        tr.addClass("shown");
                    }
                });

                if (tableId == "dataTable1") {
                    $('#loading-screen').hide();
                }
            },
        });
    });
}

function getColumns(fields) {
    var columns = [];
    for (const element of fields) {
        columns.push({ data: element, title: element });
    }
    return columns;
}

function formatRowDetails(rowData) {
    var details = document.createElement('div');
    details.className = 'row-details';

    for (var key in rowData) {
        if (rowData.hasOwnProperty(key)) {
            var detail = document.createElement('div');
            detail.className = 'detail-item';

            var label = document.createElement('span');
            label.textContent = key + ': ';
            label.className = 'detail-label';

            var value = document.createElement('span');
            value.textContent = rowData[key];
            value.className = 'detail-value';

            detail.appendChild(label);
            detail.appendChild(value);

            details.appendChild(detail);
        }
    }

    // Add custom styling for the row details container
    details.style.border = '1px solid #ddd';
    details.style.padding = '10px';
    details.style.margin = '10px 0';

    var detailItems = details.querySelectorAll('.detail-item');
    for (var i = 0; i < detailItems.length; i++) {
        detailItems[i].style.marginBottom = '8px';
    }

    return details;
}


function generateUpcomingDateOptions(dates) {
    var select = document.getElementById("upcoming-date-filter");
    for (var i = 0; i < dates.length; i++) {
        var option = document.createElement("option");
        option.value = formatDate(dates[i]);
        option.textContent = formatDate(dates[i]);
        select.appendChild(option);
    }
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}

// Add click event handlers to nav links
$("ul li a").click(function() {
    // Remove the "active" class from all nav links
    $("ul li a").removeClass("active");

    // Add the "active" class to the clicked nav link
    $(this).addClass("active");
});
