<?php
class ProfileController
{
    private $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function getProfileData($profile_id)
    {
        $profileData = $this->model->getProfileData($profile_id);

        // Convert the profile data to JSON
        $profileDataJson = json_encode($profileData);

        // Return the JSON response
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
        header('Content-Type: application/json');
        echo $profileDataJson;
    }
}
?>
