import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Assuming you have firebase initialized and exported as 'db'
import { collection, onSnapshot, query } from 'firebase/firestore';

const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'purchaseOrders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        'Fecha envio': doc.data()['Fecha envio'] ? doc.data()['Fecha envio'].toDate() : null,
      }));
      setPurchaseOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching purchase orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { purchaseOrders, loading };
};

export default usePurchaseOrders;
