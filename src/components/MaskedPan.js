import React from 'react';
import PropTypes from 'prop-types';

const MaskedPan = ({ pan, visibleDigits = 5, maskCharacter = 'x' }) => {
  if (!pan) return <span>N/A</span>;

  const panStr = pan.toString();
  

  if (panStr.length <= visibleDigits + 4) {
    return <span>{panStr}</span>; 
  }

 
  const firstPart = panStr.substring(0, visibleDigits);
  const lastPart = panStr.slice(-4);
  const masked = maskCharacter.repeat(panStr.length - visibleDigits - 4);

  return (
    <span className="masked-pan">
      {firstPart}{masked}{lastPart}
    </span>
  );
};

MaskedPan.propTypes = {
  pan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  visibleDigits: PropTypes.number,
  maskCharacter: PropTypes.string,
};

export default MaskedPan;