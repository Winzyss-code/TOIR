export default function Button({
  children,
  variant = "primary",
  size = "md",
  ...props
}) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "border hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  }

  return (
    <button
      className={`rounded-md transition font-medium ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}
