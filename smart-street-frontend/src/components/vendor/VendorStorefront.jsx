import React, { useState, useEffect } from "react";
import {
    PhotoIcon,
    ListBulletIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import LoadingSpinner from "../LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function VendorStorefront() {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state
    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState("");
    const [stallPhoto, setStallPhoto] = useState("");
    const [menuItems, setMenuItems] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [operatingHours, setOperatingHours] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    useEffect(() => {
        fetchVendor();
    }, []);

    const fetchVendor = async () => {
        try {
            const res = await api.get("/vendor/storefront");
            const vendorData = res.data.storefront;
            if (vendorData) {
                setVendor(vendorData);
                setBusinessName(vendorData.business_name || "");
                setCategory(vendorData.category || "Food");
                setStallPhoto(vendorData.stall_photo || "");
                setMenuItems(vendorData.menu_items || []);
                setIsActive(vendorData.is_active || false);
                setOperatingHours(vendorData.operating_hours?.text || "");
            }
        } catch (err) {
            // Error handled visually by failing to load UI
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;
        setMenuItems([...menuItems, { name: newItemName, price: newItemPrice }]);
        setNewItemName("");
        setNewItemPrice("");
    };

    const handleRemoveItem = (index) => {
        setMenuItems(menuItems.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/vendor/storefront", {
                businessName,
                category,
                stallPhoto,
                menuItems,
                isActive,
                operatingHours: { text: operatingHours }
            });
            setSaved(true);
            success(t("storefront_updated"));
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            error(t("failed_save"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4">
            <LoadingSpinner size="xl" className="text-blue-600" />
            <p className="text-slate-500 font-medium animate-pulse">{t("loading_storefront")}</p>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t("digital_storefront")}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t("manage_stall_appearance")}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Basic Info */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
                            {t("stall_identity")}
                        </h2>
                        {/* Live Now Toggle */}
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-green-500' : 'text-slate-400'}`}>
                               {isActive ? 'Live Now' : 'Offline'}
                             </span>
                             <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-300 dark:bg-slate-600'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-7' : 'left-1'}`} />
                             </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">{t("business_name_label")}</label>
                            <input
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                className="w-full text-[16px] md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder={t("name_of_stall_placeholder")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">{t("operating_hours") || "Operating Hours (e.g. 9am - 5pm)"}</label>
                            <input
                                value={operatingHours}
                                onChange={e => setOperatingHours(e.target.value)}
                                className="w-full text-[16px] md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">{t("category_uppercase")}</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full text-base md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="Food">{t("street_food")}</option>
                                <option value="Beverage">{t("beverages")}</option>
                                <option value="Apparel">{t("apparel_textiles")}</option>
                                <option value="Accessory">{t("accessories")}</option>
                                <option value="Produce">{t("fresh_produce")}</option>
                                <option value="Other">{t("other")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">{t("stall_photo_url")}</label>
                            <div className="flex gap-4">
                                <input
                                    value={stallPhoto}
                                    onChange={e => setStallPhoto(e.target.value)}
                                    className="flex-1 text-[16px] md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                        {stallPhoto ? (
                            <img src={stallPhoto} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <PhotoIcon className="w-12 h-12 text-slate-300 mb-2" />
                                <p className="text-xs text-slate-400">{t("photo_preview")}</p>
                            </>
                        )}
                    </div>
                </section>

                {/* Menu Items */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ListBulletIcon className="w-5 h-5 text-blue-500" />
                        {t("menu_items_list")}
                    </h2>

                    <form onSubmit={handleAddItem} className="flex gap-2">
                        <input
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-[16px] md:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={t("item_name")}
                        />
                        <input
                            value={newItemPrice}
                            onChange={e => setNewItemPrice(e.target.value)}
                            className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[16px] md:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={t("price_rupee")}
                        />
                        <button
                            type="submit"
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-xl"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden min-h-[300px]">
                        {menuItems.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {menuItems.map((item, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-slate-900 dark:text-white">₹{item.price}</span>
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400 italic">{t("no_items_listed")}</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sticky Save Footer */}
            <div className="fixed bottom-20 md:bottom-10 left-0 w-full px-4 md:px-0 z-40 flex justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-4xl flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 md:py-3 rounded-2xl font-black shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <span className="flex items-center gap-2"><LoadingSpinner size="sm" className="text-white" /> {t("saving_changes")}</span> : saved ? <span className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> {t("saved_changes")}</span> : t("save_changes_btn")}
                    </button>
                </div>
            </div>
        </div>
    );
}
