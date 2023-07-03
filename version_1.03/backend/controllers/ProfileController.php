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
    public function getGalleryData($profile_id)
    {
        $galleryData = $this->model->getGalleryData($profile_id);

        // Convert the gallery data to JSON
        $galleryDataJson = json_encode($galleryData);

        // Return the JSON response
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
        header('Content-Type: application/json');
        echo $galleryDataJson;
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
?>
