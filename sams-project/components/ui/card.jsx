export default function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      {children}
    </div>
  );
}
