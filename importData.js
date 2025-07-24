
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./data.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  for (const order of data) {
    const docRef = db.collection('purchaseOrders').doc(order.OC);
    const orderData = {
      'Orden de Compra': order['Orden de Compra'],
      'Fecha envio': admin.firestore.Timestamp.fromDate(new Date(order['Fecha envio'])),
      'Proveedor': order['Proveedor'],
      'Proceso': order['Proceso'],
      'Suministro': order['Suministro'],
      'Tiempo Entrega': order['Tiempo Entrega'],
      'Importe total': order['Importe total']
    };

    await docRef.set(orderData);

    const itemsCollectionRef = docRef.collection('items');
    for (const item of order.items) {
      await itemsCollectionRef.add({
        'Código': item['Código'],
        'Descripcion': item['Descripcion'],
        'Cantidad': item['Cantidad'],
        'Precio': item['Precio'],
        'Importe': item['Importe']
      });
    }
  }
  console.log('Data import complete!');
}

importData().catch(console.error);
