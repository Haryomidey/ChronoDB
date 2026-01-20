# ChronoDB 🕰️

ChronoDB is a high-fidelity, local-first document database designed for applications requiring robust version control, snapshotting, and offline-first capabilities.

## Key Features
- **Append-Only Storage**: All operations are logged immutably.
- **Logical Snapshots**: Captures the state of your database at specific versions.
- **Local-First**: Works entirely offline with a zero-latency index.
- **Strong Typing**: Built with TypeScript for developer productivity.
- **Optional Cloud Sync**: Mirror local snapshots to a centralized cloud instance.

## Installation
```bash
npm install chronodb
```

## Quick Start
```typescript
import ChronoDB from 'chronodb';

// Initialize the engine
const db = await ChronoDB.open({
  path: './data',
  snapshots: { interval: 60000 } // Every 1 minute
});

// Access a collection
interface User {
  name: string;
  role: string;
}
const users = db.col<User>('users');

// CRUD operations
await users.add({ name: 'Alice', role: 'Dev' });
const result = await users.get({ name: 'Alice' });

// Snapshots
const snap = await db.triggerSnapshot('manual');
console.log(`Snapshot created: ${snap?.snapshot_id}`);
```

## CLI Usage
After installing globally, use the `chronodb` command:
```bash
# Login to cloud sync
chronodb login

# List all snapshots
chronodb snapshots list

# Restore database state
chronodb snapshots restore <id>
```

## Architecture
1. **The Log**: Every write is a new line in `data.log`.
2. **The Index**: An in-memory Map maintained for O(1) reads.
3. **The Snapshot**: A metadata marker that defines "The state of the DB at version X".
4. **The Restore**: Replaying the log from version 0 to version X to reconstruct the index.

---
© 2025 ChronoSystems. Licensed under MIT.