#!/usr/bin/env node
import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import { ChronoDB } from './server';
import { fsAdapter } from './backend/utils/fs-adapter';

const CONFIG_PATH = path.join(os.homedir(), '.chronodb', 'config.json');

function loadConfig() {
  if (fsAdapter.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fsAdapter.readFileSync(CONFIG_PATH));
    } catch (e) {
      return { path: './chronodata' };
    }
  }
  return { path: './chronodata' };
}

function saveConfig(config: any) {
  fsAdapter.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function startAuthFlow() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      const email = url.searchParams.get('email');
      
      if (token && email) {
        const config = loadConfig();
        config.token = token;
        const id = typeof btoa !== 'undefined' ? btoa(email) : Buffer.from(email).toString('base64');
        config.user = { email, id };
        saveConfig(config);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authenticated!</h1><p>You can close this window and return to your terminal.</p>');
        console.log(`\nSuccessfully logged in as ${email}`);
        server.close();
        resolve(true);
      }
    });

    server.listen(4567, () => {
      const authUrl = `http://localhost:3000/auth?mode=login&cli_port=4567`;
      console.log('Opening authentication gateway in your browser...');
      console.log(`URL: ${authUrl}`);
      
      const platform = (process as any).platform;
      const start = (platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open');
      exec(`${start} "${authUrl}"`);
    });
  });
}

async function runCLI() {
  const args = (process as any).argv.slice(2);
  const command = args[0];
  const subCommand = args[1];
  const arg3 = args[2];
  const arg4 = args[3];

  const config = loadConfig();
  const db = await ChronoDB.open({ path: config.path });

  if (config.token) {
    await db.cli.login.setSession(config.user, config.token);
  }

  switch (command) {
    case 'login':
      await startAuthFlow();
      break;

    case 'logout':
      saveConfig({ path: config.path });
      console.log('Logged out successfully.');
      break;

    case 'set': {
      const [col, id, json] = [subCommand, arg3, arg4];
      if (!col || !id || !json) {
        console.log('Usage: chronodb set <collection> <id> <json_data>');
        return;
      }
      try {
        const data = JSON.parse(json);
        await db.col(col).add({ ...data, _id: id });
        console.log(`OK: Recorded ${id} in ${col}`);
      } catch (e) {
        console.error('Error: Invalid JSON data.');
      }
      break;
    }

    case 'get': {
      const [col, id] = [subCommand, arg3];
      if (!col || !id) {
        console.log('Usage: chronodb get <collection> <id>');
        return;
      }
      const doc = await db.col(col).get(id);
      if (doc) console.log(JSON.stringify(doc, null, 2));
      else console.log('Not found.');
      break;
    }

    case 'remove': {
      const [col, id] = [subCommand, arg3];
      if (!col || !id) {
        console.log('Usage: chronodb remove <collection> <id>');
        return;
      }
      await db.col(col).remove(id);
      console.log(`OK: Appended tombstone for ${id}`);
      break;
    }

    case 'stats':
      const state = db.getInternalState();
      console.log('\n--- ChronoDB Node Status ---');
      console.log(`Local Path:  ${path.resolve(config.path)}`);
      console.log(`User:        ${state.user?.email || 'Anonymous (Local-Only)'}`);
      console.log(`Version:     ${state.version}`);
      console.log(`Collections: ${state.collectionNames.join(', ') || 'none'}`);
      console.log('----------------------------\n');
      break;

    case 'snapshots':
      if (subCommand === 'list') {
        const snaps = db.snapshots.list();
        if (snaps.length === 0) console.log('No snapshots found.');
        snaps.forEach(s => console.log(`[${s.isSynced ? 'CLOUD' : 'LOCAL'}] ${s.snapshot_id} (Ver: ${s.version}) - ${s.reason}`));
      } else if (subCommand === 'create') {
        const snap = await db.triggerSnapshot('manual');
        if (snap) console.log(`Created: ${snap.snapshot_id}`);
        else console.log('No changes since last snapshot.');
      } else if (subCommand === 'delete' && arg3) {
        await db.deleteSnapshot(arg3);
        console.log(`Purged: ${arg3}`);
      } else if (subCommand === 'delete-all') {
        await db.deleteAllSnapshots();
        console.log('All markers cleared.');
      } else if (subCommand === 'sync') {
        await db.runSync();
        console.log('Manual cloud sync complete.');
      } else {
        console.log('Usage: chronodb snapshots [list|create|delete|delete-all|sync]');
      }
      break;

    case 'help':
    default:
      console.log('\nChronoDB CLI v1.0.0');
      console.log('Usage:');
      console.log('  chronodb set <col> <id> <json> Insert/Update data');
      console.log('  chronodb get <col> <id>      Read a document');
      console.log('  chronodb remove <col> <id>   Delete a document');
      console.log('  chronodb login               Authorize cloud sync');
      console.log('  chronodb stats               Show engine health');
      console.log('  chronodb snapshots list      List history markers');
      console.log('  chronodb snapshots create    Manual capture');
      console.log('\nLocal-first by design.\n');
      break;
  }
}

if (typeof process !== 'undefined' && (process as any).stdin) {
  runCLI().catch(err => {
    console.error('Fatal CLI Error:', err.message);
    (process as any).exit(1);
  });
}