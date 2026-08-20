import React from 'react';
import familyIcon from '../../../assets/icons/family-icon.svg';
const ChildrenPackageHeader = () => {
    return (
        <div className="flex items-center gap-2 mb-6 mt-6" dir="rtl">

            <img
                src={familyIcon}
                alt="باقة الأبناء"
                className="w-6 h-6 object-contain"
            />

            <h2
                className=" text-[#151C27]"
                style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    fontSize: '18px',
                    lineHeight: '28px'
                }}
            >
                باقة الأبناء
            </h2>
        </div>
    );
};

export default ChildrenPackageHeader;