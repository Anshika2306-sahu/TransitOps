function Card({ children }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
      {children}
    </div>
  );
}

export default Card;