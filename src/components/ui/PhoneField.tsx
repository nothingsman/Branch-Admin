import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

interface PhoneFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  label?: string
  required?: boolean
}

export function PhoneField({ value, onChange, error, placeholder, label, required }: PhoneFieldProps) {
  return (
    <label className="block space-y-2">
      {label && (
        <span className={`text-[10px] font-bold tracking-widest uppercase ${error ? "text-red-600" : "text-slate-400"}`}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
      <div className={`rounded-xl border bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 ${error ? "border-red-300" : "border-slate-200"}`}>
        <PhoneInput
          international
          defaultCountry="ET"
          value={value || undefined}
          onChange={(v) => onChange(v ?? "")}
          placeholder={placeholder ?? "+251 9XX XXX XXX"}
        />
      </div>
      {error && (
        <p className="pl-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </label>
  )
}
