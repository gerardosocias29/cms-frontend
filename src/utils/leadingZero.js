const leadingZero = (number) => {
  if( !number ){ return "---" }
  return number.toString().padStart(2, '0');
};

export default leadingZero;