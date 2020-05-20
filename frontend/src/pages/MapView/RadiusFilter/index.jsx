import React, { useState } from 'react';
import './styles.scss';
import InputRange from 'react-input-range';
import { updateSearchRadius } from '../../../utils/api'

const RadiusFilter = () => {
  let [radius, setRadius] = useState(500);

  const search = (newRadius) => {
    setRadius(newRadius);
    updateSearchRadius(newRadius);
  }

  return (
    <div className="radius-filter">
      <InputRange 
        minValue={10}
        maxValue={1000}
        value={radius}
        onChange={value => setRadius(value)}
        onChangeComplete={value => search(value)}
        formatLabel={value => `${value}mi`}
      />
    </div>
  )
}

export default RadiusFilter
