# ChronoDB

> **ChronoDB** is a **local-first, file-based TypeScript database engine** with schema validation, indexing, transactions, and snapshot-based versioning — designed for simplicity, predictability, and offline-first applications.

ChronoDB stores data as plain JSON files, adds strong schema guarantees, and tracks changes through snapshots that can later be synced to the cloud.

---

## ✨ Key Features

* 📁 **File-based storage** (JSON)
* 🧩 **Schema validation** (primitive, enum, defaults, custom validators)
* 🔐 **Strict mode** (reject unknown fields)
* 🆔 **Auto-generated IDs**
* ⏱ **createdAt / updatedAt timestamps**
* 🔍 **Indexed fields for faster lookups**
* 📦 **Collections API (CRUD)**
* 🔁 **Transactions with rollback**
* 🕒 **Automatic & manual snapshots**
* ☁️ **Optional cloud sync (pluggable)**
* 🧠 **Type-safe (TypeScript-first)**

---

## 📦 Installation

```
npm install chronodb
```

or

```
yarn add chronodb
```

---

## 🚀 Quick Start

```
import { ChronoEngine } from "chronodb";

const db = new ChronoEngine("./data");

const users = db.col("users", {
    schema: {
        name: "string",
        email: {
            type: "string",
            distinct: true,
        },
        role: {
            type: "enum",
            values: ["admin", "user"],
            default: "user",
        },
    },
});
```

---

## 📂 Storage Structure

ChronoDB stores everything as files:

```
data/
├─ users.json
├─ users.json.index.json
├─ .__state.json
└─ .snapshots/
   └─ meta.json
```

* **`collection.json`** → actual documents
* **`.index.json`** → auto-generated indexes
* **`.snapshots/meta.json`** → snapshot history
* **`.__state.json`** → transaction state backup

---

## 🧱 Collections

A collection represents a single JSON-backed dataset.

```
const users = db.col("users");
```

### Creating with Schema & Indexes

```
const posts = db.col("posts", {
    schema: {
        title: "string",
        published: "boolean",
        views: { type: "number", default: 0 },
    },
    indexes: ["published"],
});
```

---

## 📐 Schema System

ChronoDB enforces schemas at write-time.

### Primitive Shorthand

```
{
    name: "string",
    age: "number"
}
```

### Field Schema

```
{
    email: {
        type: "string",
        distinct: true,
        validate: v => v.includes("@")
    }
}
```

### Enum Schema

```
{
    status: {
        type: "enum",
        values: ["draft", "published"]
    }
}
```

### Supported Rules

| Rule        | Description      |
| ----------- | ---------------- |
| `type`      | Field type       |
| `important` | Required field   |
| `distinct`  | Must be unique   |
| `nullable`  | Allow null       |
| `default`   | Default value    |
| `validate`  | Custom validator |

> In **strict mode**, unknown fields are rejected.

---

## 🆕 Creating Documents

### Add One

```
const user = await users.add({
    name: "Alice",
    email: "alice@mail.com",
});
```

Automatically adds:

```
{
    id,
    createdAt,
    updatedAt
}
```

### Add Many

```
await users.addMany([
    { name: "Bob", email: "bob@mail.com" },
    { name: "Jane", email: "jane@mail.com" },
]);
```

Validation is done **atomically** across the batch.

---

## 📖 Reading Data

### Get All

```
await users.getAll();
```

### Get One

```
await users.getOne({ email: "alice@mail.com" });
```

### Get Many

```
await users.getMany({ role: "admin" });
```

---

## ✏️ Updating

### Update by ID

```
await users.updateById(id, {
    name: "Alice Updated"
});
```

* Schema is revalidated
* `updatedAt` is refreshed
* Distinct fields are respected

---

## 🗑 Deleting

### Delete by ID

```
await users.deleteById(id);
```

### Delete Many

```
await users.deleteMany({ role: "guest" });
```

### Delete All

```
await users.deleteAll();
```

---

## 🔍 Indexing

Indexes are automatically rebuilt on write.

```
db.col("users", {
    indexes: ["email", "role"]
});
```

Indexes are stored in:

```
users.json.index.json
```

> Indexing is transparent and requires no manual queries.

---

## 🔁 Transactions

ChronoDB supports **safe transactions with rollback**.

```
await db.transaction(async () => {
    await users.add({ name: "A", email: "a@mail.com" });
    await users.add({ name: "B", email: "a@mail.com" }); // ❌ duplicate
});
```

If any error occurs:

* State is restored
* No partial writes remain

---

## 🕒 Snapshots (Versioning)

ChronoDB tracks changes using **snapshots**.

### When Snapshots Are Created

* On every data change
* On manual trigger
* On time intervals

### Snapshot Metadata

```
{
    snapshotId: string;
    timestamp: number;
    version: number;
    reason: "change" | "interval" | "manual";
}
```

### List Snapshots

```
await db.snapshots.list();
```

### Delete Snapshot

```
await db.snapshots.delete(snapshotId);
```

### Delete All Snapshots

```
await db.snapshots.deleteAll();
```

### Auto Snapshot Interval

```
await db.snapshots.setInterval(60000); // every 1 min
```

> Snapshots are metadata-first and designed to power restore & cloud sync.

---

## ☁️ Cloud Sync (Optional)

ChronoDB supports **pluggable cloud sync**.

```
new ChronoEngine("./data", {
    cloudSync: true
});
```

* Snapshots are synced, not raw files
* Cloud logic is abstracted via `CloudSync`
* Authentication & providers are user-defined

> This keeps ChronoDB local-first and provider-agnostic.

---

## 🧠 Philosophy

ChronoDB is built around:

* **Predictability over magic**
* **Local-first by default**
* **Explicit schemas**
* **Durable writes**
* **Offline-safe design**
* **Composable cloud sync**

It is ideal for:

* Desktop apps
* CLI tools
* Embedded databases
* Offline-first apps
* Developer tooling

---

## 🛠 Roadmap (Planned)

* Snapshot restore / rewind
* Differential snapshot storage
* Conflict resolution strategies
* Cloud providers (S3, Firebase, custom APIs)
* Query operators (`$gt`, `$in`, `$or`)
* Read-only replicas

---

## 📜 License

MIT © You