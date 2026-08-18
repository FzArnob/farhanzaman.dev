<?php
require_once __DIR__ . '/../lib/Http.php';

class GamingController
{
    private $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function refresh()
    {
        $result = $this->model->updateVideos();
        Http::json($result, $result['success'] ? 200 : 500);
    }
}
