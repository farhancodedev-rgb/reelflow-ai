export default function Button({
  variant = 'primary',
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button type={type} className={`button-${variant} ${className}`.trim()} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
