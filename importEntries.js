// importEntries.js

// Use modular imports for Firebase Admin SDK
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read and parse a JSON file
const readJsonFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
};

/**
 * Script to import entry data from a JSON file into Firestore.
 *
 * How to run:
 * 1. Make sure `serviceAccountKey.json` is in the project root.
 * 2. Make sure `entradas_final.json` is in the project root.
 * 3. Run `node importEntries.js` from the terminal in the project root.
 */
async function importEntriesToFirestore() {
  try {
    // 1. Initialize Firebase Admin SDK
    console.log('Initializing Firebase Admin...');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('serviceAccountKey.json not found. Please place it in the project root.');
    }
    const serviceAccount = readJsonFile(serviceAccountPath);
    
    // Avoid re-initializing the app if it's already been done
    if (getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    }
    const db = getFirestore();
    console.log('Firebase Admin initialized successfully.');

    // 2. Read the entradas_final.json file
    console.log('Reading entradas_final.json...');
    const dataPath = path.join(__dirname, 'entradas_final.json');
     if (!fs.existsSync(dataPath)) {
        throw new Error('entradas_final.json not found. Please place it in the project root.');
    }
    const entries = readJsonFile(dataPath);
    console.log(`Found ${entries.length} entries to import.`);

    const collectionRef = db.collection('entries');
    console.log("Starting import into 'entries' collection...");

    // 4. Iterate over each entry object
    for (const entry of entries) {
      // 6. Structure the document with all fields from the JSON object
      const entryData = { ...entry };

      // 7. Convert date fields to Firestore Timestamp objects
      if (entryData['Fecha de Entrega']) {
        entryData['Fecha de Entrega'] = Timestamp.fromDate(new Date(entryData['Fecha de Entrega']));
      }

      // 5. Create a new document in the 'entries' collection with an auto-generated ID
      const docRef = await collectionRef.add(entryData);
      console.log(`Document created successfully with ID: ${docRef.id}`);
    }

    // 9. Print a success message
    console.log('------------------------------------------');
    console.log('✅ Data import completed successfully! ✅');
    console.log('------------------------------------------');

  } catch (error) {
    // 8. Handle errors during the import process
    console.error('❌ An error occurred during the import process:');
    console.error(error);
    process.exit(1); // Exit with an error code
  }
}

importEntriesToFirestore();
