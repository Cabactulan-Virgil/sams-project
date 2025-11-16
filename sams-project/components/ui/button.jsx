export default function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
