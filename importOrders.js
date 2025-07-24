// importOrders.js

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import the JSON file
const readJsonFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
};

/**
 * Script to import purchase order data from a JSON file into Firestore.
 *
 * How to run:
 * 1. Make sure `serviceAccountKey.json` is in the project root.
 * 2. Make sure `data.json` is in the project root.
 * 3. Run `node importOrders.js` from the terminal in the project root.
 */
async function importDataToFirestore() {
  try {
    // 1. Initialize Firebase Admin SDK
    console.log('Initializing Firebase Admin...');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('serviceAccountKey.json not found. Please place it in the project root.');
    }
    const serviceAccount = readJsonFile(serviceAccountPath);
    
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    const db = admin.firestore();
    console.log('Firebase Admin initialized successfully.');

    // 2. Read the data.json file
    console.log('Reading data.json...');
    const dataPath = path.join(__dirname, 'data.json');
     if (!fs.existsSync(dataPath)) {
        throw new Error('data.json not found. Please place it in the project root.');
    }
    const orders = readJsonFile(dataPath);
    console.log(`Found ${orders.length} orders to import.`);

    const collectionRef = db.collection('orders');
    console.log("Starting import into 'orders' collection...");

    // 4. Iterate over each order object
    for (const order of orders) {
      if (!order.OC) {
        console.warn('Skipping an order because it is missing the "OC" field.');
        continue;
      }

      // 6. Assign the value of the OC field as the document ID
      const docId = String(order.OC);
      const docRef = collectionRef.doc(docId);

      // 7. Structure the document with all fields from the JSON object
      const orderData = { ...order };

      // 8. Convert date fields to Firestore Timestamp objects
      if (orderData['Fecha envio']) {
        orderData['Fecha envio'] = admin.firestore.Timestamp.fromDate(new Date(orderData['Fecha envio']));
      }
      if (orderData['Fecha de Elaboracion']) {
        orderData['Fecha de Elaboracion'] = admin.firestore.Timestamp.fromDate(new Date(orderData['Fecha de Elaboracion']));
      }

      // 5. Create a new document in the 'orders' collection
      await docRef.set(orderData);
      console.log(`Document ${docId} created successfully.`);
    }

    // 10. Print a success message
    console.log('-----------------------------------------');
    console.log('✅ Data import completed successfully! ✅');
    console.log('-----------------------------------------');

  } catch (error) {
    // 9. Handle errors during the import process
    console.error('❌ An error occurred during the import process:');
    console.error(error);
    process.exit(1); // Exit with an error code
  }
}

importDataToFirestore();
