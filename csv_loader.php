<?php
if (isset($_POST['csv'])) {
    $csvFile = $_POST['csv'] . '.csv'; // Assuming your CSV files are named 'upcoming.csv' and 'past.csv'

    if (file_exists($csvFile)) {
        header('Content-Type: application/json');
        echo json_encode(['data' => csvToArray($csvFile)]);
        exit();
    } else {
        echo 'CSV file not found.';
    }
}

function csvToArray($file) {
    $rows = array_map('str_getcsv', file($file));
    $header = array_shift($rows);

    $data = array();
    foreach ($rows as $row) {
        $data[] = array_combine($header, $row);
    }

    return $data;
}
