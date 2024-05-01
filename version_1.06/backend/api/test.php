<?php
// Include necessary files
require_once '../config/configDatabase.php';

// Database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



// Query to get visitor count by country
$visitorCountByCountryQuery = "SELECT IFNULL(country_name, 'Others') AS country, COUNT(*) AS visitor_count FROM visitors GROUP BY country_name";

$visitorCountByCountryResult = $conn->query($visitorCountByCountryQuery);
$visitorCountByCountryData = array();
while ($row = $visitorCountByCountryResult->fetch_assoc()) {
    $visitorCountByCountryData[$row['country']] = $row['visitor_count'];
}

// Query to get visitor data for all countries
$visitorDataByCountryQuery = "SELECT * FROM visitors WHERE is_tracked = 1";
$visitorDataByCountryResult = $conn->query($visitorDataByCountryQuery);
$visitorDataByCountry = array();
while ($row = $visitorDataByCountryResult->fetch_assoc()) {
    $country = $row['country_name'] ?? 'Others';
    $visitorDataByCountry[$country][] = $row;
}

// Close connection
$conn->close();
?>

<!DOCTYPE html>
<!DOCTYPE html>
<html>

<head>
    <title>Visitor Analytics</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js"></script>
    <style>
        /* Custom CSS */
        .modal-content {
            padding: 50px;
        }

        @media (max-width: 768px) {
            .modal-content {
                padding: 30px;
            }
        }

        @media (max-width: 576px) {
            .modal-content {
                padding: 20px;
            }
        }

        @media (max-width: 576px) {
            .table-responsive {
                display: block;
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                -ms-overflow-style: -ms-autohiding-scrollbar;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col">
                <canvas id="visitorChart" width="400" height="400"></canvas>
            </div>
            <div class="col">
                <div id="visitorDataPopup" class="modal fade">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Visitor Data</h5>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Visitor ID</th>
                                                <th>IP Address</th>
                                                <th>Tracked</th>
                                                <th>Continent</th>
                                                <th>Country ISO Code</th>
                                                <th>Country Phone Code</th>
                                                <th>Country Currency</th>
                                                <th>Latitude</th>
                                                <th>Longitude</th>
                                                <th>Subdivision Name</th>
                                                <th>State Name</th>
                                                <th>City Name</th>
                                                <th>First Visit Date</th>
                                                <th>Last Active Date</th>
                                                <!-- Add more table headers as needed -->
                                            </tr>
                                        </thead>
                                        <tbody id="visitorDataBody">
                                            <!-- Visitor data rows will be inserted here dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Visitor count by country pie chart
        var visitorData = <?php echo json_encode($visitorCountByCountryData); ?>;
        var visitorLabels = Object.keys(visitorData);
        var visitorValues = Object.values(visitorData);

        var visitorChartCanvas = document.getElementById('visitorChart').getContext('2d');
        var visitorChart = new Chart(visitorChartCanvas, {
            type: 'pie',
            data: {
                labels: visitorLabels,
                datasets: [{
                    data: visitorValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        // Add more colors as needed
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: function (event, elements) {
                    if (elements && elements.length > 0) {
                        var index = elements[0].index;
                        var label = visitorChart.data.labels[index];
                        var visitorData = <?php echo json_encode($visitorDataByCountry); ?>;
                        var countryVisitorData = visitorData[label];
                        var visitorDataHtml = '';
                        if (countryVisitorData) {
                            countryVisitorData.forEach(function (visitor) {
                                visitorDataHtml += '<tr>';
                                visitorDataHtml += '<td>' + visitor.visitor_id + '</td>';
                                visitorDataHtml += '<td>' + visitor.visitor_ip + '</td>';
                                visitorDataHtml += '<td>' + (visitor.is_tracked ? 'Yes' : 'No') + '</td>';
                                visitorDataHtml += '<td>' + visitor.continent + '</td>';
                                visitorDataHtml += '<td>' + visitor.country_iso_code + '</td>';
                                visitorDataHtml += '<td>' + visitor.country_phone_code + '</td>';
                                visitorDataHtml += '<td>' + visitor.country_currency + '</td>';
                                visitorDataHtml += '<td>' + visitor.location_latitude + '</td>';
                                visitorDataHtml += '<td>' + visitor.location_longitude + '</td>';
                                visitorDataHtml += '<td>' + visitor.subdivisions_name + '</td>';
                                visitorDataHtml += '<td>' + visitor.state_name + '</td>';
                                visitorDataHtml += '<td>' + visitor.city_name + '</td>';
                                visitorDataHtml += '<td>' + visitor.created_date + '</td>';
                                visitorDataHtml += '<td>' + (visitor.updated_date ? visitor.updated_date : 'N/A') + '</td>';
                                // Add more table cells as needed
                                visitorDataHtml += '</tr>';
                            });

                            document.getElementById('visitorDataBody').innerHTML = visitorDataHtml;
                            $('#visitorDataPopup').modal('show');
                        }
                    }
                }
            }
        });
    </script>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.1/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>

</html>
