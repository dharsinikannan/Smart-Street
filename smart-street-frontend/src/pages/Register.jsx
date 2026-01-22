import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon, 
  BuildingStorefrontIcon, 
  IdentificationIcon,
  KeyIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import ThemeToggle from "../components/ThemeToggle.jsx";

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, required = true, ...props }) => (
  <div className="space-y-1 group">
    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative flex items-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/20 transition-all duration-300">
      {Icon && <Icon className="w-5 h-5 ml-3 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-transparent px-3 py-2.5 text-base md:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
        placeholder={placeholder}
        {...props}
      />
    </div>
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [activeRole, setActiveRole] = useState("VENDOR");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "VENDOR",
    businessName: "",
    category: "",
    licenseNumber: "",
    ownerName: "",
    contactInfo: "",
    adminCode: ""
  });

  const updateField = (field, value) =>
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
  // Handle role switch separately to cleaner UI state
  const handleRoleChange = (role) => {
    setActiveRole(role);
    updateField("role", role);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const user = await register(form);
      if (user.role === "VENDOR") navigate("/vendor");
      else if (user.role === "OWNER") navigate("/owner");
      else if (user.role === "ADMIN") navigate("/admin");
      else navigate("/public");
    } catch (err) {
      // context handles error state
    }
  };



  return (
    <div className="min-h-screen relative flex items-center justify-center py-10 px-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
       {/* Ambient Background */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 z-0 transition-colors duration-500"/>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-gradient-to-br from-teal-200 to-cyan-200 dark:from-teal-900/20 dark:to-cyan-900/20 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-normal" />
          <div className="absolute bottom-[0%] left-[10%] w-[50vh] h-[50vh] rounded-full bg-gradient-to-tr from-emerald-200 to-slate-200 dark:from-emerald-900/20 dark:to-slate-800/20 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-normal" />
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-[90%] md:w-full max-w-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-white/40 dark:border-white/10 z-10 transition-all">
        <div className="text-center mb-8">
           <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <h2 className="text-sm font-semibold text-cyan-600 dark:text-cyan-500 tracking-[0.3em] uppercase mb-2">Join Smart Street</h2>
           </Link>
           <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Create your account</h1>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex justify-center mb-8">
           <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
              {[
                { id: "VENDOR", label: "Vendor", icon: BuildingStorefrontIcon },
                { id: "OWNER", label: "Space Owner", icon: KeyIcon },
                { id: "ADMIN", label: "Admin", icon: LockClosedIcon }
              ].map((role) => (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeRole === role.id 
                      ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/50 ring-1 ring-white/20" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                  }`}
                >
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </button>
              ))}
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Common Fields */}
              <InputField label="Full Name" icon={UserIcon} value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="John Doe" />
              <InputField label="Phone Number" icon={PhoneIcon} value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+1 234 567 890" type="tel" />
              <InputField label="Email Address" icon={EnvelopeIcon} value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="john@example.com" type="email" />
              <InputField label="Password" icon={LockClosedIcon} value={form.password} onChange={e => updateField("password", e.target.value)} placeholder="••••••••" type="password" minLength={8} />
           </div>

           {/* Dynamic Fields based on Role */}
           <div className="pt-4 border-t border-slate-200 dark:border-white/10">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 mb-4 uppercase flex items-center gap-2">
                 {activeRole === "VENDOR" && <><BuildingStorefrontIcon className="w-4 h-4"/> Vendor Details</>}
                 {activeRole === "OWNER" && <><KeyIcon className="w-4 h-4"/> Owner Details</>}
                 {activeRole === "ADMIN" && <><LockClosedIcon className="w-4 h-4"/> Security Clearance</>}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeRole === "VENDOR" && (
                  <>
                    <InputField label="Business Name" icon={BriefcaseIcon} value={form.businessName} onChange={e => updateField("businessName", e.target.value)} placeholder="John's Food Truck" />
                    <InputField label="Category" icon={BriefcaseIcon} value={form.category} onChange={e => updateField("category", e.target.value)} placeholder="Food & Beverage" />
                    <InputField label="License Number" icon={IdentificationIcon} value={form.licenseNumber} onChange={e => updateField("licenseNumber", e.target.value)} placeholder="LIC-12345678" className="md:col-span-2" />
                  </>
                )}

                {activeRole === "OWNER" && (
                  <>
                    <InputField label="Owner Entity Name" icon={UserIcon} value={form.ownerName} onChange={e => updateField("ownerName", e.target.value)} placeholder="City Council / Pvt Ltd" />
                    <InputField label="Contact Info (Public)" icon={PhoneIcon} value={form.contactInfo} onChange={e => updateField("contactInfo", e.target.value)} placeholder="Public helpline or email" />
                  </>
                )}

                {activeRole === "ADMIN" && (
                   <div className="md:col-span-2">
                      <InputField label="Admin Access Code" icon={KeyIcon} value={form.adminCode} onChange={e => updateField("adminCode", e.target.value)} placeholder="Enter secure registration code" />
                      <p className="text-[10px] text-slate-500 mt-2 italic">* This code is provided by your system administrator.</p>
                   </div>
                )}
              </div>
           </div>

           {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-200 flex items-center gap-2">
              <span className="shrink-0 text-red-400">⚠️</span>
              {error}
            </div>
           )}

           <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
              <Link className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1 group" to="/login">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Sign In
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Profile..." : "Complete Registration"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
