"use client";

interface ResetConsentButtonProps {
  label: string;
}

export function ResetConsentButton({ label }: ResetConsentButtonProps) {
  const handleResetConsent = () => {
    localStorage.removeItem("cookies-accepted");
    localStorage.removeItem("cookies-preferences");
    window.location.reload();
  };

  return (
    <button
      onClick={handleResetConsent}
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3 rounded-2xl shadow-md transition-all text-sm cursor-pointer border border-primary/20 hover:scale-[1.02] active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
