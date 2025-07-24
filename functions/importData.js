const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./ordenes.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  console.log('Starting data import...');
  for (const oc of data) {
    const docRef = db.collection('purchaseOrders').doc(String(oc.OC));

    const purchaseOrderData = {
      'Orden de Compra': oc['Orden de Compra'] || null,
      'Fecha envio': oc['Fecha envio'] ? admin.firestore.Timestamp.fromDate(new Date(oc['Fecha envio'])) : null,
      'Proveedor': oc['Proveedor'] || null,
      'Proceso': oc['Proceso'] || null,
      'Suministro': oc['Suministro'] || null,
      'Tiempo Entrega': oc['Tiempo Entrega'] || null,
      'Importe total': typeof oc['Importe total'] === 'number' ? oc['Importe total'] : null
    };

    try {
      await docRef.set(purchaseOrderData);
      console.log(`Document ${oc.OC} created successfully.`);

      // Import items subcollection
      if (oc.items && Array.isArray(oc.items)) {
        const batch = db.batch();
        oc.items.forEach(item => {
          const itemRef = docRef.collection('items').doc(); // Auto-generate document ID for items
          batch.set(itemRef, {
            'Código': item['Código'] || null,
            'Descripcion': item['Descripcion'] || null,
            'Cantidad': typeof item['Cantidad'] === 'number' ? item['Cantidad'] : null,
            'Precio': typeof item['Precio'] === 'number' ? item['Precio'] : null,
            'Importe': typeof item['Importe'] === 'number' ? item['Importe'] : null,
          });
        });
        await batch.commit();
        console.log(`Subcollection 'items' for ${oc.OC} imported successfully.`);
      }

    } catch (error) {
      console.error(`Error importing document ${oc.OC}:`, error);
    }
  }
  console.log('Data import finished.');
}

importData().catch(console.error);