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
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js"></script>
    <style>
    </style>
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col">
                <canvas id="visitorChart"></canvas>
            </div>
            <div class="col">
                <div id="visitorDataPopup" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title" id="visitorDataTitle"></div>
                            <button type="button" class="modal-close" onclick="closeVisitorDataPopup()">&times;</button>
                        </div>
                        <div class="country-details" id="visitorDataDetails"></div>
                        <div class="modal-body">
                            <table class="visitor-table">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Latitude</th>
                                        <th>Longitude</th>
                                        <th>Subdivision Name</th>
                                        <th>State Name</th>
                                        <th>City Name</th>
                                        <th>First Visit Date</th>
                                        <th>Last Active Date</th>
                                    </tr>
                                </thead>
                                <tbody id="visitorDataBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function generateUniqueColors(count) {
            var colors = [];
            var hueStep = 360 / count; // Divide the color spectrum equally
            for (var i = 0; i < count; i++) {
                // Generate color based on hue
                var hue = i * hueStep;
                // Convert HSL to RGB
                var rgbColor = hslToRgb(hue / 360, 0.7, 0.6); // You can adjust saturation and lightness as needed
                // Convert RGB to rgba string
                var color = 'rgba(' + rgbColor[2] + ',' + rgbColor[1] + ',' + rgbColor[0] + ', 0.7)';
                colors.push(color);
            }
            return colors;
        }

        // Function to convert HSL to RGB
        function hslToRgb(h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        // Visitor count by country pie chart
        var visitorData = <?php echo json_encode($visitorCountByCountryData); ?>;
        var visitorLabels = Object.keys(visitorData);
        var visitorValues = Object.values(visitorData);
        var backgroundColors = generateUniqueColors(visitorLabels.length);

        var visitorChartCanvas = document.getElementById('visitorChart').getContext('2d');
        var visitorChart = new Chart(visitorChartCanvas, {
            type: 'pie',
            data: {
                labels: visitorLabels,
                datasets: [{
                    data: visitorValues,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: function(event, elements) {
                    if (elements && elements.length > 0) {
                        var index = elements[0].index;
                        var label = visitorChart.data.labels[index];
                        var visitorData = <?php echo json_encode($visitorDataByCountry); ?>;
                        var countryVisitorData = visitorData[label];
                        var visitorDataHtml = '';
                        if (countryVisitorData) {
                            countryVisitorData.forEach(function(visitor) {
                                visitorDataHtml += '<tr>';
                                visitorDataHtml += '<td>' + visitor.visitor_ip + '</td>';
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

                            document.getElementById('visitorDataTitle').innerHTML = 'Visitors - ' + countryVisitorData[0].country_name + ' (' + countryVisitorData[0].country_iso_code + ')';
                            document.getElementById('visitorDataDetails').innerHTML = '<b>Continent:</b> ' + countryVisitorData[0].continent + ' | <b>Phone Code:</b> ' + countryVisitorData[0].country_phone_code + ' | <b>Currency:</b> ' + countryVisitorData[0].country_currency;
                            document.getElementById('visitorDataBody').innerHTML = visitorDataHtml;
                            var visitorDataPopup = document.getElementById('visitorDataPopup');
                            visitorDataPopup.classList.remove('fadeOut');
                            visitorDataPopup.classList.add('fadeIn');
                            visitorDataPopup.style.display = 'block';
                        }
                    }
                }
            }
        });


        function closeVisitorDataPopup() {
            var visitorDataPopup = document.getElementById('visitorDataPopup');
            visitorDataPopup.classList.remove('fadeIn');
            visitorDataPopup.classList.add('fadeOut');
            setTimeout(() => {
                visitorDataPopup.style.display = 'none';
            }, 300);

        }
    </script>
</body>

</html>