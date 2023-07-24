<?php
class ProfileController
{
    private $model;

    public function __construct($model)
    {
        $this->model = $model;
    }
    private function generateJavaScriptObjectAndFile($data) {
        $json = json_encode($data, JSON_PRETTY_PRINT);
        $jsObject = "var result  = " . $json . ";";
        $jsFileName = '../../view/js/profile_data.js';

        // Open the file in write mode
        $jsFile = fopen($jsFileName, 'w');

        // Write the JavaScript object to the file
        fwrite($jsFile, $jsObject);

        // Close the file
        fclose($jsFile);
    }
    public function updateProfileData($profile_id)
    {
        $profileData = $this->model->getProfileData($profile_id);
        $this->generateJavaScriptObjectAndFile($profileData);
        // Convert the profile data to JSON
        $profileDataJson = json_encode($profileData);

        // Return the JSON response
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
        header('Content-Type: application/json');
        echo $profileDataJson;
    }
    public function sendDirectMessage($profileId, $name, $email, $subject, $message)
    {
        $directMessage = $this->model->sendDirectMessage($profileId, $name, $email, $subject, $message);

        // Convert the profile data to JSON
        $directMessageJson = json_encode($directMessage);

        // Return the JSON response
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
        header('Content-Type: application/json');
        echo $directMessageJson;
    }
}
