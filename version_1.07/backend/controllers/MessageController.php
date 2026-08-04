<?php
require_once __DIR__ . '/../lib/Http.php';

class MessageController
{
    private $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function send($profileId, $name, $email, $subject, $message)
    {
        $result = $this->model->sendDirectMessage($profileId, $name, $email, $subject, $message);
        Http::json($result, $result['success'] ? 200 : 500);
    }
}
