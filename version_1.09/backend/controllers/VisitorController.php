<?php
require_once __DIR__ . '/../lib/Http.php';

class VisitorController
{
    private $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function track($profile_id, $page_tag, $feature_tag, $activity_tag, $action_tag, $additionalData = array())
    {
        $saved = $this->model->saveVisitorData(
            $profile_id,
            $page_tag,
            $feature_tag,
            $activity_tag,
            $action_tag,
            $additionalData
        );

        Http::json(array(
            'success' => $saved,
            'message' => $saved ? 'Visitor data saved successfully' : 'Failed to save visitor data',
        ), $saved ? 200 : 500);
    }
}
