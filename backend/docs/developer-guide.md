
# ChronoDB Developer Guide v1.2.0

ChronoDB is a local-first, versioned database engine. It operates on an append-only log with logical point-in-time snapshots.

## 🚀 Getting Started

ChronoDB can be used as a standalone library or as a managed server.

### 📦 Installation
```bash
npm install chronodb
```

### 🛠️ Initialize Engine
```javascript
import { ChronoDB } from "chronodb";

// Local-only mode (Default)
const db = await ChronoDB.open();

// With specific snapshot behavior
const db = await ChronoDB.open({
  snapshots: { interval: '2m' }
});
```

## ☁️ Optional Cloud Sync
ChronoDB is local-first, meaning it works perfectly offline. Cloud sync is an optional layer for backup and multi-device access.

1. **Sign Up**: Register via the dashboard or `chronodb signup`.
2. **Login**: Run `chronodb login` in the terminal. This opens a browser window for OAuth.
3. **Auto-Sync**: Once logged in, every local snapshot is automatically securely mirrored to ChronoCloud.

### 💻 CLI Snapshot Management
- `chronodb snapshots list`: See all snapshots and their sync status.
- `chronodb snapshots create`: Force a manual system capture.
- `chronodb snapshots delete <id>`: Purge a marker locally and remotely.

## 🌐 Running ChronoDB Server
For production backends, you can run ChronoDB as a standalone service:

```bash
# Start server on custom port
chronodb-server --port 5000 --data ./db-data
```

## 🧱 Architecture Details
- **LogEngine**: The source of truth. Every `set`, `update`, or `delete` is an immutable entry in `data.log`.
- **Index**: An O(1) memory map pointing to the latest file offsets in the log.
- **Restore**: To restore, the engine wipes the index and replays the log file up to the specific `version` of the selected snapshot.
- **CloudBackend**: A secondary storage for snapshot files and account metadata. Local performance is never throttled by cloud latency.
