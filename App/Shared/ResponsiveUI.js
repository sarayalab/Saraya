import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const handleChange = ({ window }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription.remove(); // Memastikan listener dihapus dengan benar
    };
  }, []);

  const wp = (percentage) => {
    return (dimensions.width * percentage) / 100;
  };

  const hp = (percentage) => {
    return (dimensions.height * percentage) / 100;
  };

  return { wp, hp, dimensions };
};

export default useResponsive;
