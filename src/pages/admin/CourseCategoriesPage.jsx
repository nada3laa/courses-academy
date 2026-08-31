import { useCallback, useEffect, useState } from 'react';
import { Edit3, LoaderCircle, Plus, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import { createCourseCategory, getAdminCourseCategories, updateCourseCategory } from '../../services/APIService';

const unwrapList = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? data : data?.items || [];
};
const emptyForm = { id: '', nameAr: '', nameEn: '', sortOrder: 0, isActive: true };

export default function CourseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCategories(unwrapList(await getAdminCourseCategories())); }
    catch (error) { toast.error(error?.response?.data?.message || 'تعذر تحميل تصنيفات الدورات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (category) => {
    setForm({ id: category._id || category.id, nameAr: category.name?.ar || '', nameEn: category.name?.en || '', sortOrder: Number(category.sortOrder || 0), isActive: category.isActive !== false });
    setShowForm(true);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!form.nameAr.trim() && !form.nameEn.trim()) return toast.error('اكتب اسم التصنيف بالعربية أو الإنجليزية');
    setSaving(true);
    const payload = { name: { ar: form.nameAr.trim(), en: form.nameEn.trim() }, sortOrder: Number(form.sortOrder || 0), isActive: form.isActive };
    try {
      if (form.id) await updateCourseCategory(form.id, payload);
      else await createCourseCategory(payload);
      toast.success(form.id ? 'تم تعديل التصنيف' : 'تم إنشاء التصنيف');
      setShowForm(false);
      await load();
    } catch (error) { toast.error(error?.response?.data?.message || 'تعذر حفظ التصنيف'); }
    finally { setSaving(false); }
  };
  const toggle = async (category) => {
    const id = category._id || category.id;
    try {
      await updateCourseCategory(id, { isActive: category.isActive === false });
      setCategories((items) => items.map((item) => (item._id || item.id) === id ? { ...item, isActive: item.isActive === false } : item));
      toast.success(category.isActive === false ? 'تم تفعيل التصنيف' : 'تم إيقاف التصنيف');
    } catch (error) { toast.error(error?.response?.data?.message || 'تعذر تحديث التصنيف'); }
  };

  return <AdminLayout><main dir={'rtl'} className={'min-h-full rounded-xl bg-[#F7F8FC] p-4 text-right sm:p-6'}>
    <header className={'mb-6 flex flex-wrap items-center justify-between gap-4'}><div><h1 className={'text-2xl font-extrabold text-[#123C91]'}>تصنيفات الدورات</h1><p className={'mt-1 text-sm text-[#667085]'}>إدارة أسماء التصنيفات وترتيبها وظهورها في كتالوج الدورات.</p></div><button onClick={openCreate} className={'inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-5 py-3 font-bold text-white'}><Plus size={18} />إضافة تصنيف</button></header>
    {loading ? <div className={'grid min-h-72 place-items-center'}><LoaderCircle className={'animate-spin text-[#123C91]'} /></div> : <div className={'overflow-hidden rounded-2xl border bg-white shadow-sm'}><div className={'overflow-x-auto'}><table className={'w-full min-w-[700px]'}><thead className={'bg-[#F9FAFB] text-sm text-[#667085]'}><tr><th className={'px-5 py-4 text-right'}>العربي</th><th className={'px-5 py-4 text-right'}>الإنجليزي</th><th className={'px-5 py-4 text-right'}>الرابط</th><th className={'px-5 py-4 text-center'}>الترتيب</th><th className={'px-5 py-4 text-center'}>الحالة</th><th className={'px-5 py-4 text-center'}>الإجراءات</th></tr></thead><tbody className={'divide-y'}>{categories.map((category) => <tr key={category._id || category.id} className={'hover:bg-[#FAFCFF]'}><td className={'px-5 py-4 font-bold'}>{category.name?.ar || '—'}</td><td className={'px-5 py-4'} dir={'ltr'}>{category.name?.en || '—'}</td><td className={'px-5 py-4 font-mono text-xs text-[#667085]'}>{category.slug}</td><td className={'px-5 py-4 text-center'}>{category.sortOrder || 0}</td><td className={'px-5 py-4 text-center'}><button onClick={() => toggle(category)} className={'rounded-full px-3 py-1.5 text-xs font-bold ' + (category.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>{category.isActive !== false ? 'نشط' : 'غير نشط'}</button></td><td className={'px-5 py-4 text-center'}><button onClick={() => openEdit(category)} className={'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-bold text-[#123C91]'}><Edit3 size={15} />تعديل</button></td></tr>)}</tbody></table></div>{!categories.length && <div className={'p-12 text-center text-[#98A2B3]'}><Tags className={'mx-auto mb-3'} />لا توجد تصنيفات بعد.</div>}</div>}
    {showForm && <div className={'fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4'}><form onSubmit={save} className={'w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'}><h2 className={'text-xl font-extrabold'}>{form.id ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2><div className={'mt-5 grid gap-4 sm:grid-cols-2'}><label className={'text-sm font-bold'}>الاسم بالعربية<input value={form.nameAr} onChange={(event) => setForm((value) => ({ ...value, nameAr: event.target.value }))} className={'mt-2 h-11 w-full rounded-lg border px-3 font-normal'} /></label><label className={'text-sm font-bold'}>الاسم بالإنجليزية<input dir={'ltr'} value={form.nameEn} onChange={(event) => setForm((value) => ({ ...value, nameEn: event.target.value }))} className={'mt-2 h-11 w-full rounded-lg border px-3 font-normal'} /></label><label className={'text-sm font-bold'}>الترتيب<input type={'number'} min={0} value={form.sortOrder} onChange={(event) => setForm((value) => ({ ...value, sortOrder: event.target.value }))} className={'mt-2 h-11 w-full rounded-lg border px-3 font-normal'} /></label><label className={'flex items-center gap-3 self-end rounded-lg border p-3 text-sm font-bold'}><input type={'checkbox'} checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} />تصنيف نشط</label></div><div className={'mt-6 flex justify-end gap-3'}><button type={'button'} onClick={() => setShowForm(false)} className={'rounded-lg border px-5 py-2.5 font-bold'}>إلغاء</button><button disabled={saving} className={'rounded-lg bg-[#123C91] px-6 py-2.5 font-bold text-white disabled:opacity-60'}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div></form></div>}
  </main></AdminLayout>;
}
