import React, { useState } from 'react';
import { Upload, Copy, Check } from 'lucide-react';
import vodafoneIcon from '../../../assets/icons/vodafone-cash.svg';

const SubscriptionStep = ({ onNext, onBack }) => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [copied, setCopied] = useState(null);

    const plans = [
        { name: 'الباقة المجانية', details: 'حصة تجريبية مجانية', price: 'مجاني' },
        { name: 'الباقة الأساسية', details: billingCycle === 'monthly' ? '8 ساعات شهرياً' : '96 ساعة سنوياً', price: billingCycle === 'monthly' ? 'EGP 700' : 'EGP 7,500' },
        { name: 'الباقة المتقدمة', details: billingCycle === 'monthly' ? '24 ساعة شهرياً' : '288 ساعة سنوياً', price: billingCycle === 'monthly' ? 'EGP 1,500' : 'EGP 16,000' },
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div dir="rtl" className="w-full p-2 space-y-8">
            <div>
                <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] text-[#1F2937] text-right">الاشتراك والدفع</h2>
                <p className="text-[#575F69] text-[16px] mt-2">يرجى اختيار الباقة المناسبة وإتمام الدفع عبر وسائل التحويل المتاحة.</p>
            </div>

            <div className="flex justify-end">
                <div className="bg-[#FFFFFF] p-1 rounded-full border border-[#E5E5E5] flex items-center w-fit">
                    <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[#123C91] text-white [&_svg]:text-white' : 'text-[#575F69]'}`}>شهري</button>
                    <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-[#123C91] text-white [&_svg]:text-white' : 'text-[#575F69]'}`}>سنوي</button>
                </div>
            </div>

            <div className="space-y-4">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className="
                            flex justify-between items-center w-full h-20 px-6 py-4 
                            border border-[#E5E5E5] rounded-lg bg-[#FFFFFF] 
                            hover:border-[#123C91] cursor-pointer transition-all
                        "
                    >
                        <div className="text-right">
                            <h3 className="font-['IBM_Plex_Sans_Arabic'] font-normal mb-2 text-[16px] leading-6 text-[#1F2937]">
                                {plan.name}
                            </h3>
                            <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-[#8C9198]">
                                {plan.details}
                            </p>
                        </div>

                        <span className="font-['IBM_Plex_Sans_Arabic'] font-bold text-[16px] leading-6 text-[#1F2937]">
                            {plan.price}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-[#1F2937]">خطوات الدفع</h4>
                {[
                    "قم بتحويل مبلغ الباقة على أحد الحسابات",
                    "أرسل صورة إيصال التحويل أو لقطة شاشة واضحة",
                    "سيتم مراجعة طلبك وتفعيل اشتراكك خلال وقت قصير"
                ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#EBF1FF] text-[#123C91] text-[12px] font-bold">
                            {index + 1}
                        </div>
                        <p className="text-[14px] text-[#575F69]">{step}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-[#1F2937]">وسائل الدفع</h4>
                {['01000000000', '01011111111'].map((num) => (
                    <div key={num} className="flex justify-between items-center p-4 border border-[#E5E5E5] rounded-xl bg-[#FFFFFF]">
                        <div className="flex items-center gap-3">
                            <img src={vodafoneIcon} alt="Vodafone" className="w-8 h-8 object-contain" />
                            <div className="flex flex-col">
                                <span className="font-medium text-[#1F2937] mb-2">فودافون كاش</span>
                                <span className="text-sm text-[#575F69]">{num}</span>
                            </div>
                        </div>
                        <button onClick={() => handleCopy(num)} className="text-[#9CA3AF] hover:text-[#123C91]">
                            {copied === num ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                ))}
            </div>


            <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-8 text-center bg-[#FFFFFF] cursor-pointer">
                <Upload className="mx-auto text-[#123C91] mb-4" />
                <p className="font-medium text-[#123C91]">اضغط لرفع الصورة</p>
            </div>

            <div className="flex gap-4 mt-10">
                <button onClick={onNext} className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium cursor-pointer">إرسال طلب الاشتراك</button>
                <button onClick={onBack} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[123C91] cursor-pointer">السابق</button>
            </div>
        </div>
    );
};

export default SubscriptionStep;