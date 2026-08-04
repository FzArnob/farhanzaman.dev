<?php

class MessageModel
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /** Stores one contact form submission. */
    public function sendDirectMessage($profileId, $name, $email, $subject, $message)
    {
        $stmt = $this->conn->prepare(
            'INSERT INTO direct_messages (name, email, subject, message, fk_profile_id) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->bind_param('sssss', $name, $email, $subject, $message, $profileId);

        if ($stmt->execute()) {
            $data = array(
                'id' => $stmt->insert_id,
                'name' => $name,
                'email' => $email,
                'subject' => $subject,
            );
            $stmt->close();
            return array('success' => true, 'message' => 'Success: add', 'data' => $data);
        }

        $error = $stmt->error;
        $stmt->close();
        return array('success' => false, 'message' => 'Error: ' . $error);
    }
}
