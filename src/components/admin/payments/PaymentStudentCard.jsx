const Person = ({ title, person }) => (
  <div className="rounded-xl bg-[#F9FAFA] p-4">
    <h3 className="mb-3 text-sm font-semibold text-[#123C91]">{title}</h3>
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-[#8C9198]">الاسم</dt>
        <dd className="font-medium">{person?.fullName || "—"}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-[#8C9198]">البريد الإلكتروني</dt>
        <dd className="break-all text-left" dir="ltr">{person?.email || "—"}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-[#8C9198]">رقم الهاتف</dt>
        <dd dir="ltr">{person?.phone || "—"}</dd>
      </div>
    </dl>
  </div>
);

const PaymentStudentCard = ({ order }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="mb-4 font-semibold text-[#1F2937]">أطراف العملية</h2>
    <div className={`grid gap-3 ${order.parent ? "md:grid-cols-2" : ""}`}>
      <Person title="الطالب المستفيد" person={order.student?.user} />
      {order.parent && (
        <Person title="ولي الأمر" person={order.parent?.user} />
      )}
    </div>
  </div>
);

export default PaymentStudentCard;
