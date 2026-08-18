<?php

/** Reads and writes data/profile.json, keeping timestamped backups of every save. */
class ProfileStore
{
    private $path;
    private $backupDir;
    private $keepBackups;

    public function __construct($path, $backupDir, $keepBackups = 20)
    {
        $this->path = $path;
        $this->backupDir = $backupDir;
        $this->keepBackups = $keepBackups;
    }

    public function path()
    {
        return $this->path;
    }

    public function lastModified()
    {
        return file_exists($this->path) ? filemtime($this->path) : null;
    }

    /** @return array the `profile` object */
    public function load()
    {
        if (!file_exists($this->path)) {
            throw new RuntimeException('profile.json not found at ' . $this->path);
        }

        $raw = file_get_contents($this->path);
        $data = json_decode($raw, true);

        if (!is_array($data) || !isset($data['profile'])) {
            throw new RuntimeException('profile.json is not valid JSON or has no "profile" key.');
        }

        return $data['profile'];
    }

    /** Backs up the current file, then writes atomically. */
    public function save(array $profile)
    {
        $this->backup();

        $json = json_encode(
            array('profile' => $profile),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

        if ($json === false) {
            throw new RuntimeException('Could not encode profile data: ' . json_last_error_msg());
        }

        $temp = $this->path . '.tmp';
        if (file_put_contents($temp, $json . "\n") === false) {
            throw new RuntimeException('Could not write to ' . $temp . ' — check folder permissions.');
        }

        if (!rename($temp, $this->path)) {
            @unlink($temp);
            throw new RuntimeException('Could not replace ' . $this->path);
        }
    }

    private function backup()
    {
        if (!file_exists($this->path)) {
            return;
        }

        if (!is_dir($this->backupDir) && !mkdir($this->backupDir, 0755, true)) {
            return; // A missing backup folder must not block a save.
        }

        $name = 'profile-' . date('Ymd-His') . '.json';
        @copy($this->path, $this->backupDir . '/' . $name);

        $files = glob($this->backupDir . '/profile-*.json');
        if ($files === false) {
            return;
        }

        sort($files);
        $excess = count($files) - $this->keepBackups;
        for ($i = 0; $i < $excess; $i++) {
            @unlink($files[$i]);
        }
    }
}
