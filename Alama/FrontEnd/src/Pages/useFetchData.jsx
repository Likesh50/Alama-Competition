import { useEffect, useState } from 'react';
import { getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import based on your project structure

const useFetchData = (path) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, path));
        const result = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(result);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, [path]);

  return { data, error };
};

export default useFetchData;
