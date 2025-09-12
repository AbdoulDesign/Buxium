// Remplace le Button
const Button = ({ children, className, ...props }) => (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg shadow ${className}`}
    >
      {children}
    </button>
  );
  
  // Remplace le Card
  const Card = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow ${className}`}>{children}</div>
  );
  
  const CardContent = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );
  
  export { Button, Card, CardContent };
  