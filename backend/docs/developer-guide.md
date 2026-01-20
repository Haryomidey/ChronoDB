
# ChronoDB Developer Guide

ChronoDB is a local-first, document-based database engine for Node.js. It features an append-only log storage engine and automatic point-in-time snapshots.

## 📦 Installation
```bash
npm install chronodb
```

## 🚀 Quick Start
```javascript
import { ChronoDB } from "chronodb";

// Open database with 2-minute auto-snapshots
const db = await ChronoDB.open({ 
  path: "./chronodata", 
  snapshots: { interval: "2m", onChangeOnly: true }
});

const users = db.col("users");

// Add a document
await users.add({ name: "Jane", email: "jane@example.com" });

// Get by filter
const user = await users.get({ name: "Jane" });

// Update
await users.update({ name: "Jane" }, { name: "Jane Doe" });

// Remove (adds tombstone)
await users.remove("doc_id_123");
```

## 📸 Snapshots
Snapshots are logical markers of the database state.
```javascript
// List snapshots
const list = await db.snapshots.list();

// Restore to a specific point
await db.snapshots.restore("snap_17154321_v42");
```

## 💻 CLI Commands
Manage your database from the terminal:
- `chronodb login`: Login to sync your local data to ChronoDB Cloud.
- `chronodb snapshots list`: See all snapshots.
- `chronodb snapshots create --reason "manual"`: Take a manual backup.
- `chronodb snapshots delete <id>`: Remove a snapshot metadata.
- `chronodb snapshots delete-all`: Wipe snapshot history.

## ☁️ Cloud Sync (Optional)
ChronoDB is local-first. Cloud sync is entirely optional and only activates after you `login` via CLI.
- **Local Source of Truth**: Data always writes to your local disk first.
- **Incremental Sync**: Only new versions are pushed to the cloud.
- **Conflict Resolution**: Version numbers determine the latest state.