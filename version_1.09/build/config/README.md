# Production config overlay

Everything in this folder is copied over the release **after** `backend/` and
`admin/` have been copied, so any file here replaces its counterpart in the
build output. The working tree is never touched — local development config in
`version_1.09/backend/config/` stays exactly as you left it.

The layout mirrors the release root:

```
build/config/
└── backend/
    └── config/
        └── configDatabase.php   -> release_<stamp>/backend/config/configDatabase.php
```

To override anything else in production, drop it here at the same relative path.
Examples:

- `backend/config/configApp.php` — a different `UPDATE_TOKEN` or API key
- `admin/index.php` — a different `ADMIN_PASSWORD_HASH`

Note that `data/profile.json` is **not** overlaid: the release ships whatever the
admin editor last wrote, which is the intended source of truth.
