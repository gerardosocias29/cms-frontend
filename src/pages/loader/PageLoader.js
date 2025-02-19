import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

const PageLoader = () => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] overflow-hidden">
      <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
    </div>
  );
};
        
export default PageLoader;
